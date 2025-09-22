import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FileType, FileStatus } from '../dto/file.dto';

export type FileMetadataDocument = FileMetadata & Document;

@Schema({
  timestamps: true,
  collection: 'file_metadata',
})
export class FileMetadata {
  @Prop({ required: true, trim: true })
  filename: string;

  @Prop({ required: true })
  originalFilename: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true, min: 1 })
  size: number;

  @Prop({ required: true, enum: FileType, default: FileType.OTHER })
  fileType: FileType;

  @Prop({ required: true, enum: FileStatus, default: FileStatus.UPLOADING })
  status: FileStatus;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  uploadedBy: Types.ObjectId;

  @Prop({ default: Date.now })
  uploadedAt: Date;

  @Prop()
  lastAccessedAt?: Date;

  @Prop({ default: 0, min: 0 })
  downloadCount: number;

  // Storage-specific fields
  @Prop({ required: true })
  storageKey: string; // S3/MinIO object key

  @Prop({ required: true })
  bucket: string;

  @Prop()
  etag?: string; // S3 ETag for integrity verification

  @Prop()
  versionId?: string; // S3 version ID if versioning is enabled

  // Security fields
  @Prop()
  virusScanStatus?: 'pending' | 'clean' | 'infected' | 'error';

  @Prop()
  virusScanDate?: Date;

  @Prop()
  virusScanResult?: string;

  // Metadata
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  // Soft delete
  @Prop()
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy?: Types.ObjectId;

  // Expiration
  @Prop()
  expiresAt?: Date;
}

export const FileMetadataSchema = SchemaFactory.createForClass(FileMetadata);

// Indexes for performance
FileMetadataSchema.index({ uploadedBy: 1, status: 1 });
FileMetadataSchema.index({ fileType: 1, status: 1 });
FileMetadataSchema.index({ tags: 1 });
FileMetadataSchema.index({ storageKey: 1 }, { unique: true });
FileMetadataSchema.index({ uploadedAt: -1 });
FileMetadataSchema.index({ lastAccessedAt: -1 });
FileMetadataSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
FileMetadataSchema.index({ deletedAt: 1 });

// Text search index
FileMetadataSchema.index({
  filename: 'text',
  originalFilename: 'text',
  description: 'text',
  tags: 'text',
});

// Transform function to clean up the output
FileMetadataSchema.set('toJSON', {
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.storageKey; // Don't expose internal storage details
    delete ret.bucket;
    delete ret.etag;
    delete ret.versionId;
    return ret;
  },
});

// Virtual for download URL (will be populated by service)
FileMetadataSchema.virtual('downloadUrl').get(function() {
  return undefined; // Will be set by service when needed
});

FileMetadataSchema.virtual('downloadUrlExpiresAt').get(function() {
  return undefined; // Will be set by service when needed
});

// Ensure virtuals are included in JSON output
FileMetadataSchema.set('toJSON', { virtuals: true });

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
