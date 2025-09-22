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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileMetadataService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const file_metadata_schema_1 = require("./schemas/file-metadata.schema");
const file_dto_1 = require("./dto/file.dto");
let FileMetadataService = class FileMetadataService {
    constructor(fileMetadataModel) {
        this.fileMetadataModel = fileMetadataModel;
    }
    async create(createDto) {
        const fileMetadata = new this.fileMetadataModel({
            ...createDto,
            status: file_dto_1.FileStatus.UPLOADING,
            uploadedAt: new Date(),
            downloadCount: 0,
        });
        return fileMetadata.save();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid file ID');
        }
        const file = await this.fileMetadataModel.findById(id).exec();
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async findByStorageKey(storageKey) {
        const file = await this.fileMetadataModel.findOne({ storageKey }).exec();
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async findMany(queryDto, userId) {
        const { page = 1, limit = 10, search, fileType, status, tags, sortBy = 'uploadedAt', sortOrder = 'desc', includeDeleted = false, } = queryDto;
        const filter = {};
        if (userId) {
            filter.uploadedBy = userId;
        }
        if (search) {
            filter.$or = [
                { filename: { $regex: search, $options: 'i' } },
                { originalFilename: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }
        if (fileType) {
            filter.fileType = fileType;
        }
        if (status) {
            filter.status = status;
        }
        if (tags && tags.length > 0) {
            filter.tags = { $in: tags };
        }
        if (!includeDeleted) {
            filter.deletedAt = { $exists: false };
        }
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
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
    async update(id, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid file ID');
        }
        const file = await this.fileMetadataModel.findByIdAndUpdate(id, { ...updateDto, updatedAt: new Date() }, { new: true }).exec();
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async updateByStorageKey(storageKey, updateDto) {
        const file = await this.fileMetadataModel.findOneAndUpdate({ storageKey }, { ...updateDto, updatedAt: new Date() }, { new: true }).exec();
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async incrementDownloadCount(id) {
        await this.fileMetadataModel.findByIdAndUpdate(id, {
            $inc: { downloadCount: 1 },
            lastAccessedAt: new Date(),
        }).exec();
    }
    async softDelete(id, deletedBy) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid file ID');
        }
        const file = await this.fileMetadataModel.findByIdAndUpdate(id, {
            deletedAt: new Date(),
            deletedBy,
            status: file_dto_1.FileStatus.DELETED,
        }, { new: true }).exec();
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async restore(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid file ID');
        }
        const file = await this.fileMetadataModel.findByIdAndUpdate(id, {
            $unset: { deletedAt: 1, deletedBy: 1 },
            status: file_dto_1.FileStatus.AVAILABLE,
        }, { new: true }).exec();
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        return file;
    }
    async hardDelete(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid file ID');
        }
        const result = await this.fileMetadataModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('File not found');
        }
    }
    async findByUser(userId, queryDto) {
        return this.findMany(queryDto, userId);
    }
    async findExpiredFiles() {
        return this.fileMetadataModel.find({
            expiresAt: { $lte: new Date() },
            deletedAt: { $exists: false },
        }).exec();
    }
    async findOrphanedFiles(olderThanHours = 24) {
        const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
        return this.fileMetadataModel.find({
            status: file_dto_1.FileStatus.UPLOADING,
            uploadedAt: { $lt: cutoffDate },
        }).exec();
    }
    async getFileStats(userId) {
        const matchFilter = { deletedAt: { $exists: false } };
        if (userId) {
            matchFilter.uploadedBy = new mongoose_2.Types.ObjectId(userId);
        }
        const [totalStats, typeStats, statusStats,] = await Promise.all([
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
        const filesByType = Object.values(file_dto_1.FileType).reduce((acc, type) => {
            acc[type] = 0;
            return acc;
        }, {});
        typeStats.forEach(stat => {
            filesByType[stat._id] = stat.count;
        });
        const filesByStatus = Object.values(file_dto_1.FileStatus).reduce((acc, status) => {
            acc[status] = 0;
            return acc;
        }, {});
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
    async cleanupExpiredFiles() {
        const expiredFiles = await this.findExpiredFiles();
        for (const file of expiredFiles) {
            await this.hardDelete(file._id.toString());
        }
        return expiredFiles.length;
    }
    async cleanupOrphanedFiles() {
        const orphanedFiles = await this.findOrphanedFiles();
        for (const file of orphanedFiles) {
            await this.hardDelete(file._id.toString());
        }
        return orphanedFiles.length;
    }
};
exports.FileMetadataService = FileMetadataService;
exports.FileMetadataService = FileMetadataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(file_metadata_schema_1.FileMetadata.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FileMetadataService);
//# sourceMappingURL=file-metadata.service.js.map