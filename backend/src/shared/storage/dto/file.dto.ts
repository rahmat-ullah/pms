import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  PDF = 'pdf',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

export enum FileStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  AVAILABLE = 'available',
  QUARANTINED = 'quarantined',
  DELETED = 'deleted',
}

export class UploadFileDto {
  @ApiProperty({ example: 'profile-image.jpg' })
  @IsString()
  filename: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  @Min(1)
  @Max(100 * 1024 * 1024) // 100MB max
  size: number;

  @ApiPropertyOptional({ enum: FileType })
  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @ApiPropertyOptional({ example: 'User profile image' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['profile', 'user'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;
}

export class FileMetadataDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'profile-image.jpg' })
  filename: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  size: number;

  @ApiProperty({ enum: FileType })
  fileType: FileType;

  @ApiProperty({ enum: FileStatus })
  status: FileStatus;

  @ApiPropertyOptional({ example: 'User profile image' })
  description?: string;

  @ApiPropertyOptional({ example: ['profile', 'user'] })
  tags?: string[];

  @ApiProperty({ example: false })
  isPublic: boolean;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  uploadedBy: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  uploadedAt: Date;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  lastAccessedAt?: Date;

  @ApiPropertyOptional({ example: 5 })
  downloadCount?: number;

  @ApiPropertyOptional({ example: 'https://storage.example.com/files/...' })
  downloadUrl?: string;

  @ApiPropertyOptional({ example: '2023-01-01T01:00:00.000Z' })
  downloadUrlExpiresAt?: Date;
}

export class GenerateUploadUrlDto {
  @ApiProperty({ example: 'profile-image.jpg' })
  @IsString()
  filename: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  @Min(1)
  @Max(100 * 1024 * 1024) // 100MB max
  size: number;

  @ApiPropertyOptional({ enum: FileType })
  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @ApiPropertyOptional({ example: 'User profile image' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['profile', 'user'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;
}

export class UploadUrlResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  fileId: string;

  @ApiProperty({ example: 'https://storage.example.com/upload/...' })
  uploadUrl: string;

  @ApiProperty({ example: '2023-01-01T01:00:00.000Z' })
  expiresAt: Date;

  @ApiProperty({ example: { 'x-amz-meta-file-id': '507f1f77bcf86cd799439011' } })
  headers: Record<string, string>;
}

export class FileQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'image' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: FileType })
  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @ApiPropertyOptional({ enum: FileStatus })
  @IsOptional()
  @IsEnum(FileStatus)
  status?: FileStatus;

  @ApiPropertyOptional({ example: ['profile'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'uploadedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'uploadedAt';

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeDeleted?: boolean = false;
}

export class FileListResponseDto {
  @ApiProperty({ type: [FileMetadataDto] })
  data: FileMetadataDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPrevPage: boolean;
}

export class FileStatsDto {
  @ApiProperty({ example: 1000 })
  totalFiles: number;

  @ApiProperty({ example: 1073741824 }) // 1GB in bytes
  totalSize: number;

  @ApiProperty({ example: { [FileType.IMAGE]: 500, [FileType.DOCUMENT]: 300 } })
  filesByType: Record<FileType, number>;

  @ApiProperty({ example: { [FileStatus.AVAILABLE]: 800, [FileStatus.PROCESSING]: 50 } })
  filesByStatus: Record<FileStatus, number>;

  @ApiProperty({ example: 5000 })
  totalDownloads: number;

  @ApiProperty({ example: 107374182.4 }) // Average file size in bytes
  averageFileSize: number;
}
