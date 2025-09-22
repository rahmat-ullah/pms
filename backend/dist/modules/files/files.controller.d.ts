import { FilesService } from './files.service';
import { GenerateUploadUrlDto, UploadUrlResponseDto, FileMetadataDto, FileQueryDto, FileListResponseDto, FileStatsDto } from '../../shared/storage/dto/file.dto';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    generateUploadUrl(generateUploadUrlDto: GenerateUploadUrlDto, user: any): Promise<UploadUrlResponseDto>;
    completeUpload(id: string, user: any): Promise<FileMetadataDto>;
    findAll(queryDto: FileQueryDto, user: any): Promise<FileListResponseDto>;
    getStats(user: any): Promise<FileStatsDto>;
    getMyFiles(queryDto: FileQueryDto, user: any): Promise<FileListResponseDto>;
    findOne(id: string, user: any): Promise<FileMetadataDto>;
    generateDownloadUrl(id: string, user: any): Promise<{
        downloadUrl: string;
        expiresAt: Date;
    }>;
    update(id: string, updateDto: Partial<FileMetadataDto>, user: any): Promise<FileMetadataDto>;
    remove(id: string, user: any): Promise<void>;
    restore(id: string): Promise<FileMetadataDto>;
    permanentDelete(id: string): Promise<void>;
    cleanupExpiredFiles(): Promise<{
        deletedCount: number;
    }>;
    cleanupOrphanedFiles(): Promise<{
        deletedCount: number;
    }>;
    private hasAdminAccess;
}
