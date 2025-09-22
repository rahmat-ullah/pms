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
var FilesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const storage_service_1 = require("../../shared/storage/storage.service");
const file_metadata_service_1 = require("../../shared/storage/file-metadata.service");
const file_dto_1 = require("../../shared/storage/dto/file.dto");
let FilesService = FilesService_1 = class FilesService {
    constructor(storageService, fileMetadataService) {
        this.storageService = storageService;
        this.fileMetadataService = fileMetadataService;
        this.logger = new common_1.Logger(FilesService_1.name);
    }
    async generateUploadUrl(generateUploadUrlDto, userId) {
        const { filename, mimeType, size, fileType, description, tags, isPublic } = generateUploadUrlDto;
        this.storageService.validateFile(filename, mimeType, size);
        const determinedFileType = fileType || this.storageService.determineFileType(mimeType);
        const uploadResult = await this.storageService.generateUploadUrl(filename, mimeType, size, userId, { description, tags, isPublic });
        const fileMetadata = await this.fileMetadataService.create({
            filename: uploadResult.storageKey.split('/').pop() || filename,
            originalFilename: filename,
            mimeType,
            size,
            fileType: determinedFileType,
            description,
            tags: tags || [],
            isPublic: isPublic || false,
            uploadedBy: new mongoose_1.Types.ObjectId(userId),
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
    async uploadFile(file, path, userId, options) {
        const uploadResult = await this.generateUploadUrl({
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            description: options?.description,
            tags: options?.tags,
            isPublic: options?.isPublic,
        }, userId);
        const storageKey = `${path}/${Date.now()}-${file.originalname}`;
        await this.storageService.uploadBuffer(file.buffer, storageKey, file.mimetype);
        const completedFile = await this.completeUpload(uploadResult.fileId, userId);
        const downloadUrl = await this.generateDownloadUrl(uploadResult.fileId, userId);
        return {
            id: uploadResult.fileId,
            url: downloadUrl.downloadUrl,
            filename: file.originalname,
        };
    }
    async completeUpload(fileId, userId) {
        const file = await this.fileMetadataService.findById(fileId);
        if (file.uploadedBy.toString() !== userId) {
            throw new common_1.BadRequestException('Access denied to this file');
        }
        try {
            const fileInfo = await this.storageService.getFileInfo(file.storageKey);
            const updatedFile = await this.fileMetadataService.update(fileId, {
                status: file_dto_1.FileStatus.AVAILABLE,
                metadata: {
                    etag: fileInfo.ETag,
                    lastModified: fileInfo.LastModified,
                    contentLength: fileInfo.ContentLength,
                },
            });
            this.logger.log(`File upload completed: ${fileId}`);
            return this.transformToDto(updatedFile);
        }
        catch (error) {
            await this.fileMetadataService.update(fileId, {
                status: file_dto_1.FileStatus.DELETED,
            });
            throw new common_1.BadRequestException('File upload verification failed');
        }
    }
    async findAll(queryDto, userId) {
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
    async findOne(id) {
        const file = await this.fileMetadataService.findById(id);
        return this.transformToDto(file);
    }
    async generateDownloadUrl(fileId, userId) {
        const file = await this.fileMetadataService.findById(fileId);
        const downloadResult = await this.storageService.generateDownloadUrl(file.storageKey, file.originalFilename);
        await this.fileMetadataService.incrementDownloadCount(fileId);
        this.logger.log(`Download URL generated for file: ${fileId} by user: ${userId}`);
        return downloadResult;
    }
    async update(id, updateDto) {
        const { id: _, uploadedBy, uploadedAt, ...allowedUpdates } = updateDto;
        const updatedFile = await this.fileMetadataService.update(id, allowedUpdates);
        return this.transformToDto(updatedFile);
    }
    async remove(id, deletedBy) {
        await this.fileMetadataService.softDelete(id, new mongoose_1.Types.ObjectId(deletedBy));
        this.logger.log(`File soft deleted: ${id} by user: ${deletedBy}`);
    }
    async restore(id) {
        const restoredFile = await this.fileMetadataService.restore(id);
        this.logger.log(`File restored: ${id}`);
        return this.transformToDto(restoredFile);
    }
    async permanentDelete(id) {
        const file = await this.fileMetadataService.findById(id);
        try {
            await this.storageService.deleteFile(file.storageKey);
        }
        catch (error) {
            this.logger.warn(`Failed to delete file from storage: ${file.storageKey}`, error);
        }
        await this.fileMetadataService.hardDelete(id);
        this.logger.log(`File permanently deleted: ${id}`);
    }
    async getStats(userId) {
        return this.fileMetadataService.getFileStats(userId);
    }
    async cleanupExpiredFiles() {
        const expiredFiles = await this.fileMetadataService.findExpiredFiles();
        let deletedCount = 0;
        for (const file of expiredFiles) {
            try {
                await this.permanentDelete(file._id.toString());
                deletedCount++;
            }
            catch (error) {
                this.logger.error(`Failed to delete expired file: ${file._id}`, error);
            }
        }
        this.logger.log(`Cleaned up ${deletedCount} expired files`);
        return deletedCount;
    }
    async cleanupOrphanedFiles() {
        const orphanedFiles = await this.fileMetadataService.findOrphanedFiles();
        let deletedCount = 0;
        for (const file of orphanedFiles) {
            try {
                await this.permanentDelete(file._id.toString());
                deletedCount++;
            }
            catch (error) {
                this.logger.error(`Failed to delete orphaned file: ${file._id}`, error);
            }
        }
        this.logger.log(`Cleaned up ${deletedCount} orphaned files`);
        return deletedCount;
    }
    transformToDto(file) {
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
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = FilesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [storage_service_1.StorageService,
        file_metadata_service_1.FileMetadataService])
], FilesService);
//# sourceMappingURL=files.service.js.map