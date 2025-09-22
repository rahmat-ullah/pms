import { StorageService } from '../../shared/storage/storage.service';
import { FileMetadataService } from '../../shared/storage/file-metadata.service';
import { GenerateUploadUrlDto, UploadUrlResponseDto, FileMetadataDto, FileQueryDto, FileListResponseDto, FileStatsDto } from '../../shared/storage/dto/file.dto';
export declare class FilesService {
    private readonly storageService;
    private readonly fileMetadataService;
    private readonly logger;
    constructor(storageService: StorageService, fileMetadataService: FileMetadataService);
    generateUploadUrl(generateUploadUrlDto: GenerateUploadUrlDto, userId: string): Promise<UploadUrlResponseDto>;
    uploadFile(file: Express.Multer.File, path: string, userId: string, options?: {
        description?: string;
        tags?: string[];
        isPublic?: boolean;
    }): Promise<{
        id: string;
        url: string;
        filename: string;
    }>;
    completeUpload(fileId: string, userId: string): Promise<FileMetadataDto>;
    findAll(queryDto: FileQueryDto, userId?: string): Promise<FileListResponseDto>;
    findOne(id: string): Promise<FileMetadataDto>;
    generateDownloadUrl(fileId: string, userId: string): Promise<{
        downloadUrl: string;
        expiresAt: Date;
    }>;
    update(id: string, updateDto: Partial<FileMetadataDto>): Promise<FileMetadataDto>;
    remove(id: string, deletedBy: string): Promise<void>;
    restore(id: string): Promise<FileMetadataDto>;
    permanentDelete(id: string): Promise<void>;
    getStats(userId?: string): Promise<FileStatsDto>;
    cleanupExpiredFiles(): Promise<number>;
    cleanupOrphanedFiles(): Promise<number>;
    private transformToDto;
}
