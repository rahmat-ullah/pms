import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { FileType, FileStatus } from './dto/file.dto';

export interface UploadUrlResult {
  uploadUrl: string;
  storageKey: string;
  expiresAt: Date;
  headers: Record<string, string>;
}

export interface DownloadUrlResult {
  downloadUrl: string;
  expiresAt: Date;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: AWS.S3;
  private readonly bucket: string;
  private readonly region: string;
  private readonly urlExpirationMinutes: number;

  // Supported file types and their MIME types
  private readonly supportedMimeTypes = new Map<string, FileType>([
    // Images
    ['image/jpeg', FileType.IMAGE],
    ['image/jpg', FileType.IMAGE],
    ['image/png', FileType.IMAGE],
    ['image/gif', FileType.IMAGE],
    ['image/webp', FileType.IMAGE],
    ['image/svg+xml', FileType.IMAGE],
    
    // Documents
    ['application/pdf', FileType.PDF],
    ['application/msword', FileType.DOCUMENT],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', FileType.DOCUMENT],
    ['text/plain', FileType.DOCUMENT],
    ['text/rtf', FileType.DOCUMENT],
    
    // Spreadsheets
    ['application/vnd.ms-excel', FileType.SPREADSHEET],
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', FileType.SPREADSHEET],
    ['text/csv', FileType.SPREADSHEET],
    
    // Presentations
    ['application/vnd.ms-powerpoint', FileType.PRESENTATION],
    ['application/vnd.openxmlformats-officedocument.presentationml.presentation', FileType.PRESENTATION],
    
    // Archives
    ['application/zip', FileType.ARCHIVE],
    ['application/x-rar-compressed', FileType.ARCHIVE],
    ['application/x-7z-compressed', FileType.ARCHIVE],
    ['application/gzip', FileType.ARCHIVE],
  ]);

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('MINIO_BUCKET_NAME', 'pms-files');
    this.region = this.configService.get<string>('STORAGE_REGION', 'us-east-1');
    this.urlExpirationMinutes = this.configService.get<number>('STORAGE_URL_EXPIRATION_MINUTES', 60);

    // Configure S3 client for MinIO
    const minioHost = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const minioPort = this.configService.get<string>('MINIO_PORT', '9000');
    const minioUseSSL = this.configService.get<boolean>('MINIO_USE_SSL', false);
    const protocol = minioUseSSL ? 'https' : 'http';
    const endpoint = `${protocol}://${minioHost}:${minioPort}`;

    this.s3 = new AWS.S3({
      endpoint,
      accessKeyId: this.configService.get<string>('MINIO_ACCESS_KEY', 'admin'),
      secretAccessKey: this.configService.get<string>('MINIO_SECRET_KEY', 'password123'),
      region: this.region,
      s3ForcePathStyle: true, // Required for MinIO
      signatureVersion: 'v4',
    });

    this.initializeBucket();
  }

  private async initializeBucket(): Promise<void> {
    try {
      await this.s3.headBucket({ Bucket: this.bucket }).promise();
      this.logger.log(`Storage bucket '${this.bucket}' is accessible`);
    } catch (error) {
      if (error.statusCode === 404) {
        try {
          await this.s3.createBucket({ Bucket: this.bucket }).promise();
          this.logger.log(`Created storage bucket '${this.bucket}'`);
        } catch (createError) {
          this.logger.error(`Failed to create bucket '${this.bucket}':`, createError);
          throw new InternalServerErrorException('Failed to initialize storage bucket');
        }
      } else {
        this.logger.error(`Failed to access bucket '${this.bucket}':`, error);
        throw new InternalServerErrorException('Failed to access storage bucket');
      }
    }
  }

  async generateUploadUrl(
    filename: string,
    mimeType: string,
    size: number,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<UploadUrlResult> {
    this.validateFile(filename, mimeType, size);

    const fileId = uuidv4();
    const storageKey = this.generateStorageKey(fileId, filename);
    const expiresAt = new Date(Date.now() + this.urlExpirationMinutes * 60 * 1000);

    const uploadParams = {
      Bucket: this.bucket,
      Key: storageKey,
      Expires: this.urlExpirationMinutes * 60,
      Conditions: [
        ['content-length-range', size, size], // Exact size match
        ['eq', '$Content-Type', mimeType],
      ],
      Fields: {
        'Content-Type': mimeType,
        'x-amz-meta-file-id': fileId,
        'x-amz-meta-uploaded-by': userId,
        'x-amz-meta-original-filename': filename,
        ...(metadata && { 'x-amz-meta-custom': JSON.stringify(metadata) }),
      },
    };

    try {
      const presignedPost = await this.s3.createPresignedPost(uploadParams);
      
      return {
        uploadUrl: presignedPost.url,
        storageKey,
        expiresAt,
        headers: {
          ...presignedPost.fields,
          'Content-Type': mimeType,
        },
      };
    } catch (error) {
      this.logger.error('Failed to generate upload URL:', error);
      throw new InternalServerErrorException('Failed to generate upload URL');
    }
  }

  async generateDownloadUrl(storageKey: string, filename?: string): Promise<DownloadUrlResult> {
    const expiresAt = new Date(Date.now() + this.urlExpirationMinutes * 60 * 1000);

    const downloadParams: AWS.S3.GetObjectRequest = {
      Bucket: this.bucket,
      Key: storageKey,
      ...(filename && { ResponseContentDisposition: `attachment; filename="${filename}"` }),
    };

    try {
      const downloadUrl = await this.s3.getSignedUrlPromise('getObject', {
        ...downloadParams,
        Expires: this.urlExpirationMinutes * 60,
      });

      return {
        downloadUrl,
        expiresAt,
      };
    } catch (error) {
      this.logger.error('Failed to generate download URL:', error);
      throw new InternalServerErrorException('Failed to generate download URL');
    }
  }

  async deleteFile(storageKey: string): Promise<void> {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucket,
        Key: storageKey,
      }).promise();

      this.logger.log(`Deleted file: ${storageKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${storageKey}:`, error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async getFileInfo(storageKey: string): Promise<AWS.S3.HeadObjectOutput> {
    try {
      return await this.s3.headObject({
        Bucket: this.bucket,
        Key: storageKey,
      }).promise();
    } catch (error) {
      if (error.statusCode === 404) {
        throw new NotFoundException('File not found in storage');
      }
      this.logger.error(`Failed to get file info for ${storageKey}:`, error);
      throw new InternalServerErrorException('Failed to get file information');
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    storageKey: string,
    mimeType: string,
  ): Promise<void> {
    try {
      await this.s3.upload({
        Bucket: this.bucket,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
      }).promise();

      this.logger.log(`Uploaded buffer to ${storageKey}`);
    } catch (error) {
      this.logger.error(`Failed to upload buffer to ${storageKey}:`, error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      await this.s3.copyObject({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
      }).promise();

      this.logger.log(`Copied file from ${sourceKey} to ${destinationKey}`);
    } catch (error) {
      this.logger.error(`Failed to copy file from ${sourceKey} to ${destinationKey}:`, error);
      throw new InternalServerErrorException('Failed to copy file');
    }
  }

  determineFileType(mimeType: string): FileType {
    return this.supportedMimeTypes.get(mimeType) || FileType.OTHER;
  }

  validateFile(filename: string, mimeType: string, size: number): void {
    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (size > maxSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    // Check if MIME type is supported
    if (!this.supportedMimeTypes.has(mimeType)) {
      throw new BadRequestException(`Unsupported file type: ${mimeType}`);
    }

    // Check filename
    if (!filename || filename.trim().length === 0) {
      throw new BadRequestException('Filename is required');
    }

    // Check for dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js'];
    const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExtension)) {
      throw new BadRequestException(`File type not allowed: ${fileExtension}`);
    }
  }

  private generateStorageKey(fileId: string, filename: string): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `files/${timestamp}/${fileId}/${sanitizedFilename}`;
  }

  async getStorageStats(): Promise<{
    totalObjects: number;
    totalSize: number;
  }> {
    try {
      let totalObjects = 0;
      let totalSize = 0;
      let continuationToken: string | undefined;

      do {
        const result = await this.s3.listObjectsV2({
          Bucket: this.bucket,
          ContinuationToken: continuationToken,
        }).promise();

        if (result.Contents) {
          totalObjects += result.Contents.length;
          totalSize += result.Contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
        }

        continuationToken = result.NextContinuationToken;
      } while (continuationToken);

      return { totalObjects, totalSize };
    } catch (error) {
      this.logger.error('Failed to get storage stats:', error);
      throw new InternalServerErrorException('Failed to get storage statistics');
    }
  }
}
