import { Model, Types } from 'mongoose';
import { FileMetadataDocument } from './schemas/file-metadata.schema';
import { FileType, FileStatus, FileQueryDto } from './dto/file.dto';
import { PaginationResult } from '../database/repositories/base.repository';
export interface CreateFileMetadataDto {
    filename: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    fileType: FileType;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
    uploadedBy: Types.ObjectId;
    storageKey: string;
    bucket: string;
    etag?: string;
    versionId?: string;
    metadata?: Record<string, any>;
}
export interface UpdateFileMetadataDto {
    status?: FileStatus;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
    lastAccessedAt?: Date;
    downloadCount?: number;
    virusScanStatus?: 'pending' | 'clean' | 'infected' | 'error';
    virusScanDate?: Date;
    virusScanResult?: string;
    metadata?: Record<string, any>;
    expiresAt?: Date;
}
export declare class FileMetadataService {
    private readonly fileMetadataModel;
    constructor(fileMetadataModel: Model<FileMetadataDocument>);
    create(createDto: CreateFileMetadataDto): Promise<FileMetadataDocument>;
    findById(id: string): Promise<FileMetadataDocument>;
    findByStorageKey(storageKey: string): Promise<FileMetadataDocument>;
    findMany(queryDto: FileQueryDto, userId?: string): Promise<PaginationResult<FileMetadataDocument>>;
    update(id: string, updateDto: UpdateFileMetadataDto): Promise<FileMetadataDocument>;
    updateByStorageKey(storageKey: string, updateDto: UpdateFileMetadataDto): Promise<FileMetadataDocument>;
    incrementDownloadCount(id: string): Promise<void>;
    softDelete(id: string, deletedBy: Types.ObjectId): Promise<FileMetadataDocument>;
    restore(id: string): Promise<FileMetadataDocument>;
    hardDelete(id: string): Promise<void>;
    findByUser(userId: string, queryDto: FileQueryDto): Promise<PaginationResult<FileMetadataDocument>>;
    findExpiredFiles(): Promise<FileMetadataDocument[]>;
    findOrphanedFiles(olderThanHours?: number): Promise<FileMetadataDocument[]>;
    getFileStats(userId?: string): Promise<{
        totalFiles: number;
        totalSize: number;
        filesByType: Record<FileType, number>;
        filesByStatus: Record<FileStatus, number>;
        totalDownloads: number;
        averageFileSize: number;
    }>;
    cleanupExpiredFiles(): Promise<number>;
    cleanupOrphanedFiles(): Promise<number>;
}
