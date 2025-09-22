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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const mongoose_1 = require("mongoose");
const common_1 = require("@nestjs/common");
let BaseRepository = class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async create(createDto) {
        const entity = new this.model(createDto);
        return entity.save();
    }
    async createMany(createDtos) {
        return this.model.insertMany(createDtos);
    }
    async findById(id) {
        return this.model.findById(id).exec();
    }
    async findOne(filter) {
        return this.model.findOne(filter).exec();
    }
    async findMany(filter = {}) {
        return this.model.find(filter).exec();
    }
    async findWithPagination(filter = {}, options = {}) {
        const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
            this.model.countDocuments(filter).exec(),
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
    async update(id, updateDto, options = { new: true }) {
        return this.model.findByIdAndUpdate(id, updateDto, options).exec();
    }
    async updateOne(filter, updateDto, options = { new: true }) {
        return this.model.findOneAndUpdate(filter, updateDto, options).exec();
    }
    async updateMany(filter, updateDto) {
        return this.model.updateMany(filter, updateDto).exec();
    }
    async delete(id) {
        return this.model.findByIdAndDelete(id).exec();
    }
    async deleteOne(filter) {
        return this.model.findOneAndDelete(filter).exec();
    }
    async deleteMany(filter) {
        return this.model.deleteMany(filter).exec();
    }
    async count(filter = {}) {
        return this.model.countDocuments(filter).exec();
    }
    async exists(filter) {
        const count = await this.model.countDocuments(filter).limit(1).exec();
        return count > 0;
    }
    async aggregate(pipeline) {
        return this.model.aggregate(pipeline).exec();
    }
    async search(searchTerm, searchFields, filter = {}, options = {}) {
        const searchFilter = {
            ...filter,
            $or: searchFields.map(field => ({
                [field]: { $regex: searchTerm, $options: 'i' },
            })),
        };
        return this.findWithPagination(searchFilter, options);
    }
    async softDelete(id, deletedBy) {
        const updateData = {
            archivedAt: new Date(),
        };
        if (deletedBy) {
            updateData.archivedBy = deletedBy;
        }
        return this.update(id, updateData);
    }
    async restore(id) {
        return this.update(id, {
            $unset: { archivedAt: 1, archivedBy: 1 },
        });
    }
    async findActive(filter = {}) {
        return this.findMany({
            ...filter,
            archivedAt: { $exists: false },
        });
    }
    async findArchived(filter = {}) {
        return this.findMany({
            ...filter,
            archivedAt: { $exists: true },
        });
    }
    async withTransaction(operation) {
        const session = await this.model.db.startSession();
        session.startTransaction();
        try {
            const result = await operation(session);
            await session.commitTransaction();
            return result;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async bulkWrite(operations) {
        return this.model.bulkWrite(operations);
    }
    async createIndex(indexSpec, options) {
        const result = await this.model.collection.createIndex(indexSpec, options);
        return result;
    }
    async dropIndex(indexName) {
        return this.model.collection.dropIndex(indexName);
    }
    async getIndexes() {
        return this.model.collection.getIndexes();
    }
};
exports.BaseRepository = BaseRepository;
exports.BaseRepository = BaseRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mongoose_1.Model])
], BaseRepository);
//# sourceMappingURL=base.repository.js.map