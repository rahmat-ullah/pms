import { Document, Types } from 'mongoose';
import { FileType, FileStatus } from '../dto/file.dto';
export type FileMetadataDocument = FileMetadata & Document;
export declare class FileMetadata {
    filename: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    fileType: FileType;
    status: FileStatus;
    description?: string;
    tags: string[];
    isPublic: boolean;
    uploadedBy: Types.ObjectId;
    uploadedAt: Date;
    lastAccessedAt?: Date;
    downloadCount: number;
    storageKey: string;
    bucket: string;
    etag?: string;
    versionId?: string;
    virusScanStatus?: 'pending' | 'clean' | 'infected' | 'error';
    virusScanDate?: Date;
    virusScanResult?: string;
    metadata?: Record<string, any>;
    deletedAt?: Date;
    deletedBy?: Types.ObjectId;
    expiresAt?: Date;
}
export declare const FileMetadataSchema: import("mongoose").Schema<FileMetadata, import("mongoose").Model<FileMetadata, any, any, any, Document<unknown, any, FileMetadata, any, {}> & FileMetadata & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, FileMetadata, Document<unknown, {}, import("mongoose").FlatRecord<FileMetadata>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<FileMetadata> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export interface FileMetadataInterface {
    id: string;
    filename: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    fileType: FileType;
    status: FileStatus;
    description?: string;
    tags: string[];
    isPublic: boolean;
    uploadedBy: string;
    uploadedAt: Date;
    lastAccessedAt?: Date;
    downloadCount: number;
    virusScanStatus?: string;
    virusScanDate?: Date;
    metadata?: Record<string, any>;
    deletedAt?: Date;
    deletedBy?: string;
    expiresAt?: Date;
    downloadUrl?: string;
    downloadUrlExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
