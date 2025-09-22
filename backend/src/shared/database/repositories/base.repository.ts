import { Document, Model, FilterQuery, UpdateQuery, QueryOptions, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable()
export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(createDto: Partial<T>): Promise<T> {
    const entity = new this.model(createDto);
    return entity.save();
  }

  async createMany(createDtos: Partial<T>[]): Promise<T[]> {
    return this.model.insertMany(createDtos) as unknown as Promise<T[]>;
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findMany(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async findWithPagination(
    filter: FilterQuery<T> = {},
    options: PaginationOptions = {},
  ): Promise<PaginationResult<T>> {
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

  async update(
    id: string | Types.ObjectId,
    updateDto: UpdateQuery<T>,
    options: QueryOptions = { new: true },
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateDto, options).exec();
  }

  async updateOne(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
    options: QueryOptions = { new: true },
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, updateDto, options).exec();
  }

  async updateMany(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
  ): Promise<{ acknowledged: boolean; modifiedCount: number; matchedCount: number }> {
    return this.model.updateMany(filter, updateDto).exec();
  }

  async delete(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async deleteOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filter).exec();
  }

  async deleteMany(filter: FilterQuery<T>): Promise<{ acknowledged: boolean; deletedCount: number }> {
    return this.model.deleteMany(filter).exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.model.aggregate(pipeline).exec();
  }

  async search(
    searchTerm: string,
    searchFields: string[],
    filter: FilterQuery<T> = {},
    options: PaginationOptions = {},
  ): Promise<PaginationResult<T>> {
    const searchFilter = {
      ...filter,
      $or: searchFields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    };

    return this.findWithPagination(searchFilter, options);
  }

  async softDelete(id: string | Types.ObjectId, deletedBy?: Types.ObjectId): Promise<T | null> {
    const updateData: any = {
      archivedAt: new Date(),
    };

    if (deletedBy) {
      updateData.archivedBy = deletedBy;
    }

    return this.update(id, updateData);
  }

  async restore(id: string | Types.ObjectId): Promise<T | null> {
    return this.update(id, {
      $unset: { archivedAt: 1, archivedBy: 1 },
    });
  }

  async findActive(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.findMany({
      ...filter,
      archivedAt: { $exists: false },
    });
  }

  async findArchived(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.findMany({
      ...filter,
      archivedAt: { $exists: true },
    });
  }

  // Transaction support
  async withTransaction<R>(
    operation: (session: any) => Promise<R>,
  ): Promise<R> {
    const session = await this.model.db.startSession();
    session.startTransaction();

    try {
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Bulk operations
  async bulkWrite(operations: any[]): Promise<any> {
    return this.model.bulkWrite(operations);
  }

  // Index management
  async createIndex(indexSpec: any, options?: any): Promise<string> {
    const result = await this.model.collection.createIndex(indexSpec, options);
    return result;
  }

  async dropIndex(indexName: string): Promise<any> {
    return this.model.collection.dropIndex(indexName);
  }

  async getIndexes(): Promise<any> {
    return this.model.collection.getIndexes();
  }
}
