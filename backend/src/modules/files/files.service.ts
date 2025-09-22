import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { StorageService } from '../../shared/storage/storage.service';
import { FileMetadataService } from '../../shared/storage/file-metadata.service';
import {
  GenerateUploadUrlDto,
  UploadUrlResponseDto,
  FileMetadataDto,
  FileQueryDto,
  FileListResponseDto,
  FileStatsDto,
  FileStatus,
} from '../../shared/storage/dto/file.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly fileMetadataService: FileMetadataService,
  ) {}

  async generateUploadUrl(
    generateUploadUrlDto: GenerateUploadUrlDto,
    userId: string,
  ): Promise<UploadUrlResponseDto> {
    const { filename, mimeType, size, fileType, description, tags, isPublic } = generateUploadUrlDto;

    // Validate file
    this.storageService.validateFile(filename, mimeType, size);

    // Determine file type if not provided
    const determinedFileType = fileType || this.storageService.determineFileType(mimeType);

    // Generate upload URL
    const uploadResult = await this.storageService.generateUploadUrl(
      filename,
      mimeType,
      size,
      userId,
      { description, tags, isPublic },
    );

    // Create file metadata record
    const fileMetadata = await this.fileMetadataService.create({
      filename: uploadResult.storageKey.split('/').pop() || filename,
      originalFilename: filename,
      mimeType,
      size,
      fileType: determinedFileType,
      description,
      tags: tags || [],
      isPublic: isPublic || false,
      uploadedBy: new Types.ObjectId(userId),
      storageKey: uploadResult.storageKey,
      bucket: process.env.MINIO_BUCKET_NAME || 'pms-files',
    });

    return {
      fileId: fileMetadata._id.toString(),
      uploadUrl: uploadResult.uploadUrl,
      expiresAt: uploadResult.expiresAt,
      headers: uploadResult.headers,
    };
  }

  async uploadFile(
    file: Express.Multer.File,
    path: string,
    userId: string,
    options?: { description?: string; tags?: string[]; isPublic?: boolean }
  ): Promise<{ id: string; url: string; filename: string }> {
    // Generate upload URL first
    const uploadResult = await this.generateUploadUrl(
      {
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        description: options?.description,
        tags: options?.tags,
        isPublic: options?.isPublic,
      },
      userId,
    );

    // Upload file directly to storage
    const storageKey = `${path}/${Date.now()}-${file.originalname}`;
    await this.storageService.uploadBuffer(
      file.buffer,
      storageKey,
      file.mimetype,
    );

    // Complete the upload
    const completedFile = await this.completeUpload(uploadResult.fileId, userId);

    // Generate download URL
    const downloadUrl = await this.generateDownloadUrl(uploadResult.fileId, userId);

    return {
      id: uploadResult.fileId,
      url: downloadUrl.downloadUrl,
      filename: file.originalname,
    };
  }

  async completeUpload(fileId: string, userId: string): Promise<FileMetadataDto> {
    const file = await this.fileMetadataService.findById(fileId);

    // Verify ownership
    if (file.uploadedBy.toString() !== userId) {
      throw new BadRequestException('Access denied to this file');
    }

    // Verify file exists in storage
    try {
      const fileInfo = await this.storageService.getFileInfo(file.storageKey);
      
      // Update file metadata with storage information
      const updatedFile = await this.fileMetadataService.update(fileId, {
        status: FileStatus.AVAILABLE,
        metadata: {
          etag: fileInfo.ETag,
          lastModified: fileInfo.LastModified,
          contentLength: fileInfo.ContentLength,
        },
      });

      this.logger.log(`File upload completed: ${fileId}`);
      return this.transformToDto(updatedFile);
    } catch (error) {
      // File not found in storage, mark as failed
      await this.fileMetadataService.update(fileId, {
        status: FileStatus.DELETED,
      });
      
      throw new BadRequestException('File upload verification failed');
    }
  }

  async findAll(queryDto: FileQueryDto, userId?: string): Promise<FileListResponseDto> {
    const result = await this.fileMetadataService.findMany(queryDto, userId);
    
    return {
      data: result.data.map(file => this.transformToDto(file)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    };
  }

  async findOne(id: string): Promise<FileMetadataDto> {
    const file = await this.fileMetadataService.findById(id);
    return this.transformToDto(file);
  }

  async generateDownloadUrl(
    fileId: string,
    userId: string,
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    const file = await this.fileMetadataService.findById(fileId);

    // Generate download URL
    const downloadResult = await this.storageService.generateDownloadUrl(
      file.storageKey,
      file.originalFilename,
    );

    // Increment download count
    await this.fileMetadataService.incrementDownloadCount(fileId);

    this.logger.log(`Download URL generated for file: ${fileId} by user: ${userId}`);

    return downloadResult;
  }

  async update(id: string, updateDto: Partial<FileMetadataDto>): Promise<FileMetadataDto> {
    // Filter out read-only fields
    const { id: _, uploadedBy, uploadedAt, ...allowedUpdates } = updateDto;
    
    const updatedFile = await this.fileMetadataService.update(id, allowedUpdates);
    return this.transformToDto(updatedFile);
  }

  async remove(id: string, deletedBy: string): Promise<void> {
    await this.fileMetadataService.softDelete(id, new Types.ObjectId(deletedBy));
    this.logger.log(`File soft deleted: ${id} by user: ${deletedBy}`);
  }

  async restore(id: string): Promise<FileMetadataDto> {
    const restoredFile = await this.fileMetadataService.restore(id);
    this.logger.log(`File restored: ${id}`);
    return this.transformToDto(restoredFile);
  }

  async permanentDelete(id: string): Promise<void> {
    const file = await this.fileMetadataService.findById(id);

    try {
      // Delete from storage
      await this.storageService.deleteFile(file.storageKey);
    } catch (error) {
      this.logger.warn(`Failed to delete file from storage: ${file.storageKey}`, error);
      // Continue with metadata deletion even if storage deletion fails
    }

    // Delete metadata
    await this.fileMetadataService.hardDelete(id);
    this.logger.log(`File permanently deleted: ${id}`);
  }

  async getStats(userId?: string): Promise<FileStatsDto> {
    return this.fileMetadataService.getFileStats(userId);
  }

  async cleanupExpiredFiles(): Promise<number> {
    const expiredFiles = await this.fileMetadataService.findExpiredFiles();
    let deletedCount = 0;

    for (const file of expiredFiles) {
      try {
        await this.permanentDelete(file._id.toString());
        deletedCount++;
      } catch (error) {
        this.logger.error(`Failed to delete expired file: ${file._id}`, error);
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} expired files`);
    return deletedCount;
  }

  async cleanupOrphanedFiles(): Promise<number> {
    const orphanedFiles = await this.fileMetadataService.findOrphanedFiles();
    let deletedCount = 0;

    for (const file of orphanedFiles) {
      try {
        await this.permanentDelete(file._id.toString());
        deletedCount++;
      } catch (error) {
        this.logger.error(`Failed to delete orphaned file: ${file._id}`, error);
      }
    }

    this.logger.log(`Cleaned up ${deletedCount} orphaned files`);
    return deletedCount;
  }

  private transformToDto(file: any): FileMetadataDto {
    return {
      id: file._id?.toString() || file.id,
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.size,
      fileType: file.fileType,
      status: file.status,
      description: file.description,
      tags: file.tags || [],
      isPublic: file.isPublic,
      uploadedBy: file.uploadedBy?.toString(),
      uploadedAt: file.uploadedAt,
      lastAccessedAt: file.lastAccessedAt,
      downloadCount: file.downloadCount || 0,
      downloadUrl: file.downloadUrl,
      downloadUrlExpiresAt: file.downloadUrlExpiresAt,
    };
  }
}
