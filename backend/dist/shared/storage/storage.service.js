"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const AWS = require("aws-sdk");
const uuid_1 = require("uuid");
const file_dto_1 = require("./dto/file.dto");
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
        this.supportedMimeTypes = new Map([
            ['image/jpeg', file_dto_1.FileType.IMAGE],
            ['image/jpg', file_dto_1.FileType.IMAGE],
            ['image/png', file_dto_1.FileType.IMAGE],
            ['image/gif', file_dto_1.FileType.IMAGE],
            ['image/webp', file_dto_1.FileType.IMAGE],
            ['image/svg+xml', file_dto_1.FileType.IMAGE],
            ['application/pdf', file_dto_1.FileType.PDF],
            ['application/msword', file_dto_1.FileType.DOCUMENT],
            ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', file_dto_1.FileType.DOCUMENT],
            ['text/plain', file_dto_1.FileType.DOCUMENT],
            ['text/rtf', file_dto_1.FileType.DOCUMENT],
            ['application/vnd.ms-excel', file_dto_1.FileType.SPREADSHEET],
            ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', file_dto_1.FileType.SPREADSHEET],
            ['text/csv', file_dto_1.FileType.SPREADSHEET],
            ['application/vnd.ms-powerpoint', file_dto_1.FileType.PRESENTATION],
            ['application/vnd.openxmlformats-officedocument.presentationml.presentation', file_dto_1.FileType.PRESENTATION],
            ['application/zip', file_dto_1.FileType.ARCHIVE],
            ['application/x-rar-compressed', file_dto_1.FileType.ARCHIVE],
            ['application/x-7z-compressed', file_dto_1.FileType.ARCHIVE],
            ['application/gzip', file_dto_1.FileType.ARCHIVE],
        ]);
        this.bucket = this.configService.get('MINIO_BUCKET_NAME', 'pms-files');
        this.region = this.configService.get('STORAGE_REGION', 'us-east-1');
        this.urlExpirationMinutes = this.configService.get('STORAGE_URL_EXPIRATION_MINUTES', 60);
        const minioHost = this.configService.get('MINIO_ENDPOINT', 'localhost');
        const minioPort = this.configService.get('MINIO_PORT', '9000');
        const minioUseSSL = this.configService.get('MINIO_USE_SSL', false);
        const protocol = minioUseSSL ? 'https' : 'http';
        const endpoint = `${protocol}://${minioHost}:${minioPort}`;
        this.s3 = new AWS.S3({
            endpoint,
            accessKeyId: this.configService.get('MINIO_ACCESS_KEY', 'admin'),
            secretAccessKey: this.configService.get('MINIO_SECRET_KEY', 'password123'),
            region: this.region,
            s3ForcePathStyle: true,
            signatureVersion: 'v4',
        });
        this.initializeBucket();
    }
    async initializeBucket() {
        try {
            await this.s3.headBucket({ Bucket: this.bucket }).promise();
            this.logger.log(`Storage bucket '${this.bucket}' is accessible`);
        }
        catch (error) {
            if (error.statusCode === 404) {
                try {
                    await this.s3.createBucket({ Bucket: this.bucket }).promise();
                    this.logger.log(`Created storage bucket '${this.bucket}'`);
                }
                catch (createError) {
                    this.logger.error(`Failed to create bucket '${this.bucket}':`, createError);
                    throw new common_1.InternalServerErrorException('Failed to initialize storage bucket');
                }
            }
            else {
                this.logger.error(`Failed to access bucket '${this.bucket}':`, error);
                throw new common_1.InternalServerErrorException('Failed to access storage bucket');
            }
        }
    }
    async generateUploadUrl(filename, mimeType, size, userId, metadata) {
        this.validateFile(filename, mimeType, size);
        const fileId = (0, uuid_1.v4)();
        const storageKey = this.generateStorageKey(fileId, filename);
        const expiresAt = new Date(Date.now() + this.urlExpirationMinutes * 60 * 1000);
        const uploadParams = {
            Bucket: this.bucket,
            Key: storageKey,
            Expires: this.urlExpirationMinutes * 60,
            Conditions: [
                ['content-length-range', size, size],
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
        }
        catch (error) {
            this.logger.error('Failed to generate upload URL:', error);
            throw new common_1.InternalServerErrorException('Failed to generate upload URL');
        }
    }
    async generateDownloadUrl(storageKey, filename) {
        const expiresAt = new Date(Date.now() + this.urlExpirationMinutes * 60 * 1000);
        const downloadParams = {
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
        }
        catch (error) {
            this.logger.error('Failed to generate download URL:', error);
            throw new common_1.InternalServerErrorException('Failed to generate download URL');
        }
    }
    async deleteFile(storageKey) {
        try {
            await this.s3.deleteObject({
                Bucket: this.bucket,
                Key: storageKey,
            }).promise();
            this.logger.log(`Deleted file: ${storageKey}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file ${storageKey}:`, error);
            throw new common_1.InternalServerErrorException('Failed to delete file');
        }
    }
    async getFileInfo(storageKey) {
        try {
            return await this.s3.headObject({
                Bucket: this.bucket,
                Key: storageKey,
            }).promise();
        }
        catch (error) {
            if (error.statusCode === 404) {
                throw new common_1.NotFoundException('File not found in storage');
            }
            this.logger.error(`Failed to get file info for ${storageKey}:`, error);
            throw new common_1.InternalServerErrorException('Failed to get file information');
        }
    }
    async uploadBuffer(buffer, storageKey, mimeType) {
        try {
            await this.s3.upload({
                Bucket: this.bucket,
                Key: storageKey,
                Body: buffer,
                ContentType: mimeType,
            }).promise();
            this.logger.log(`Uploaded buffer to ${storageKey}`);
        }
        catch (error) {
            this.logger.error(`Failed to upload buffer to ${storageKey}:`, error);
            throw new common_1.InternalServerErrorException('Failed to upload file');
        }
    }
    async copyFile(sourceKey, destinationKey) {
        try {
            await this.s3.copyObject({
                Bucket: this.bucket,
                CopySource: `${this.bucket}/${sourceKey}`,
                Key: destinationKey,
            }).promise();
            this.logger.log(`Copied file from ${sourceKey} to ${destinationKey}`);
        }
        catch (error) {
            this.logger.error(`Failed to copy file from ${sourceKey} to ${destinationKey}:`, error);
            throw new common_1.InternalServerErrorException('Failed to copy file');
        }
    }
    determineFileType(mimeType) {
        return this.supportedMimeTypes.get(mimeType) || file_dto_1.FileType.OTHER;
    }
    validateFile(filename, mimeType, size) {
        const maxSize = 100 * 1024 * 1024;
        if (size > maxSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${maxSize} bytes`);
        }
        if (!this.supportedMimeTypes.has(mimeType)) {
            throw new common_1.BadRequestException(`Unsupported file type: ${mimeType}`);
        }
        if (!filename || filename.trim().length === 0) {
            throw new common_1.BadRequestException('Filename is required');
        }
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js'];
        const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        if (dangerousExtensions.includes(fileExtension)) {
            throw new common_1.BadRequestException(`File type not allowed: ${fileExtension}`);
        }
    }
    generateStorageKey(fileId, filename) {
        const timestamp = new Date().toISOString().split('T')[0];
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `files/${timestamp}/${fileId}/${sanitizedFilename}`;
    }
    async getStorageStats() {
        try {
            let totalObjects = 0;
            let totalSize = 0;
            let continuationToken;
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
        }
        catch (error) {
            this.logger.error('Failed to get storage stats:', error);
            throw new common_1.InternalServerErrorException('Failed to get storage statistics');
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map