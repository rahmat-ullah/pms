import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { FileType } from './dto/file.dto';
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
export declare class StorageService {
    private readonly configService;
    private readonly logger;
    private readonly s3;
    private readonly bucket;
    private readonly region;
    private readonly urlExpirationMinutes;
    private readonly supportedMimeTypes;
    constructor(configService: ConfigService);
    private initializeBucket;
    generateUploadUrl(filename: string, mimeType: string, size: number, userId: string, metadata?: Record<string, any>): Promise<UploadUrlResult>;
    generateDownloadUrl(storageKey: string, filename?: string): Promise<DownloadUrlResult>;
    deleteFile(storageKey: string): Promise<void>;
    getFileInfo(storageKey: string): Promise<AWS.S3.HeadObjectOutput>;
    uploadBuffer(buffer: Buffer, storageKey: string, mimeType: string): Promise<void>;
    copyFile(sourceKey: string, destinationKey: string): Promise<void>;
    determineFileType(mimeType: string): FileType;
    validateFile(filename: string, mimeType: string, size: number): void;
    private generateStorageKey;
    getStorageStats(): Promise<{
        totalObjects: number;
        totalSize: number;
    }>;
}
