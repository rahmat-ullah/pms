export declare enum FileType {
    IMAGE = "image",
    DOCUMENT = "document",
    SPREADSHEET = "spreadsheet",
    PRESENTATION = "presentation",
    PDF = "pdf",
    ARCHIVE = "archive",
    OTHER = "other"
}
export declare enum FileStatus {
    UPLOADING = "uploading",
    PROCESSING = "processing",
    AVAILABLE = "available",
    QUARANTINED = "quarantined",
    DELETED = "deleted"
}
export declare class UploadFileDto {
    filename: string;
    mimeType: string;
    size: number;
    fileType?: FileType;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
}
export declare class FileMetadataDto {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    fileType: FileType;
    status: FileStatus;
    description?: string;
    tags?: string[];
    isPublic: boolean;
    uploadedBy: string;
    uploadedAt: Date;
    lastAccessedAt?: Date;
    downloadCount?: number;
    downloadUrl?: string;
    downloadUrlExpiresAt?: Date;
}
export declare class GenerateUploadUrlDto {
    filename: string;
    mimeType: string;
    size: number;
    fileType?: FileType;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
}
export declare class UploadUrlResponseDto {
    fileId: string;
    uploadUrl: string;
    expiresAt: Date;
    headers: Record<string, string>;
}
export declare class FileQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    fileType?: FileType;
    status?: FileStatus;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeDeleted?: boolean;
}
export declare class FileListResponseDto {
    data: FileMetadataDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare class FileStatsDto {
    totalFiles: number;
    totalSize: number;
    filesByType: Record<FileType, number>;
    filesByStatus: Record<FileStatus, number>;
    totalDownloads: number;
    averageFileSize: number;
}
