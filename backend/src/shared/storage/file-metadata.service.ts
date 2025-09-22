import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileMetadata, FileMetadataDocument } from './schemas/file-metadata.schema';
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

@Injectable()
export class FileMetadataService {
  constructor(
    @InjectModel(FileMetadata.name)
    private readonly fileMetadataModel: Model<FileMetadataDocument>,
  ) {}

  async create(createDto: CreateFileMetadataDto): Promise<FileMetadataDocument> {
    const fileMetadata = new this.fileMetadataModel({
      ...createDto,
      status: FileStatus.UPLOADING,
      uploadedAt: new Date(),
      downloadCount: 0,
    });

    return fileMetadata.save();
  }

  async findById(id: string): Promise<FileMetadataDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid file ID');
    }

    const file = await this.fileMetadataModel.findById(id).exec();
    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async findByStorageKey(storageKey: string): Promise<FileMetadataDocument> {
    const file = await this.fileMetadataModel.findOne({ storageKey }).exec();
    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async findMany(queryDto: FileQueryDto, userId?: string): Promise<PaginationResult<FileMetadataDocument>> {
    const {
      page = 1,
      limit = 10,
      search,
      fileType,
      status,
      tags,
      sortBy = 'uploadedAt',
      sortOrder = 'desc',
      includeDeleted = false,
    } = queryDto;

    const filter: any = {};

    // User filter - users can only see their own files unless they're admin
    if (userId) {
      filter.uploadedBy = userId;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { originalFilename: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Type filter
    if (fileType) {
      filter.fileType = fileType;
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Tags filter
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Deleted filter
    if (!includeDeleted) {
      filter.deletedAt = { $exists: false };
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.fileMetadataModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.fileMetadataModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async update(id: string, updateDto: UpdateFileMetadataDto): Promise<FileMetadataDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid file ID');
    }

    const file = await this.fileMetadataModel.findByIdAndUpdate(
      id,
      { ...updateDto, updatedAt: new Date() },
      { new: true },
    ).exec();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async updateByStorageKey(storageKey: string, updateDto: UpdateFileMetadataDto): Promise<FileMetadataDocument> {
    const file = await this.fileMetadataModel.findOneAndUpdate(
      { storageKey },
      { ...updateDto, updatedAt: new Date() },
      { new: true },
    ).exec();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.fileMetadataModel.findByIdAndUpdate(
      id,
      {
        $inc: { downloadCount: 1 },
        lastAccessedAt: new Date(),
      },
    ).exec();
  }

  async softDelete(id: string, deletedBy: Types.ObjectId): Promise<FileMetadataDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid file ID');
    }

    const file = await this.fileMetadataModel.findByIdAndUpdate(
      id,
      {
        deletedAt: new Date(),
        deletedBy,
        status: FileStatus.DELETED,
      },
      { new: true },
    ).exec();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async restore(id: string): Promise<FileMetadataDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid file ID');
    }

    const file = await this.fileMetadataModel.findByIdAndUpdate(
      id,
      {
        $unset: { deletedAt: 1, deletedBy: 1 },
        status: FileStatus.AVAILABLE,
      },
      { new: true },
    ).exec();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async hardDelete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid file ID');
    }

    const result = await this.fileMetadataModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('File not found');
    }
  }

  async findByUser(userId: string, queryDto: FileQueryDto): Promise<PaginationResult<FileMetadataDocument>> {
    return this.findMany(queryDto, userId);
  }

  async findExpiredFiles(): Promise<FileMetadataDocument[]> {
    return this.fileMetadataModel.find({
      expiresAt: { $lte: new Date() },
      deletedAt: { $exists: false },
    }).exec();
  }

  async findOrphanedFiles(olderThanHours: number = 24): Promise<FileMetadataDocument[]> {
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    
    return this.fileMetadataModel.find({
      status: FileStatus.UPLOADING,
      uploadedAt: { $lt: cutoffDate },
    }).exec();
  }

  async getFileStats(userId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<FileType, number>;
    filesByStatus: Record<FileStatus, number>;
    totalDownloads: number;
    averageFileSize: number;
  }> {
    const matchFilter: any = { deletedAt: { $exists: false } };
    if (userId) {
      matchFilter.uploadedBy = new Types.ObjectId(userId);
    }

    const [
      totalStats,
      typeStats,
      statusStats,
    ] = await Promise.all([
      this.fileMetadataModel.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalFiles: { $sum: 1 },
            totalSize: { $sum: '$size' },
            totalDownloads: { $sum: '$downloadCount' },
            averageFileSize: { $avg: '$size' },
          },
        },
      ]).exec(),
      this.fileMetadataModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$fileType', count: { $sum: 1 } } },
      ]).exec(),
      this.fileMetadataModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).exec(),
    ]);

    const filesByType = Object.values(FileType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<FileType, number>);

    typeStats.forEach(stat => {
      filesByType[stat._id] = stat.count;
    });

    const filesByStatus = Object.values(FileStatus).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<FileStatus, number>);

    statusStats.forEach(stat => {
      filesByStatus[stat._id] = stat.count;
    });

    const stats = totalStats[0] || {
      totalFiles: 0,
      totalSize: 0,
      totalDownloads: 0,
      averageFileSize: 0,
    };

    return {
      ...stats,
      filesByType,
      filesByStatus,
    };
  }

  async cleanupExpiredFiles(): Promise<number> {
    const expiredFiles = await this.findExpiredFiles();
    
    for (const file of expiredFiles) {
      await this.hardDelete(file._id.toString());
    }

    return expiredFiles.length;
  }

  async cleanupOrphanedFiles(): Promise<number> {
    const orphanedFiles = await this.findOrphanedFiles();
    
    for (const file of orphanedFiles) {
      await this.hardDelete(file._id.toString());
    }

    return orphanedFiles.length;
  }
}
