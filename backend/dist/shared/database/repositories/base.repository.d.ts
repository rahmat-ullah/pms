import { Document, Model, FilterQuery, UpdateQuery, QueryOptions, Types } from 'mongoose';
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
export declare abstract class BaseRepository<T extends Document> {
    protected readonly model: Model<T>;
    constructor(model: Model<T>);
    create(createDto: Partial<T>): Promise<T>;
    createMany(createDtos: Partial<T>[]): Promise<T[]>;
    findById(id: string | Types.ObjectId): Promise<T | null>;
    findOne(filter: FilterQuery<T>): Promise<T | null>;
    findMany(filter?: FilterQuery<T>): Promise<T[]>;
    findWithPagination(filter?: FilterQuery<T>, options?: PaginationOptions): Promise<PaginationResult<T>>;
    update(id: string | Types.ObjectId, updateDto: UpdateQuery<T>, options?: QueryOptions): Promise<T | null>;
    updateOne(filter: FilterQuery<T>, updateDto: UpdateQuery<T>, options?: QueryOptions): Promise<T | null>;
    updateMany(filter: FilterQuery<T>, updateDto: UpdateQuery<T>): Promise<{
        acknowledged: boolean;
        modifiedCount: number;
        matchedCount: number;
    }>;
    delete(id: string | Types.ObjectId): Promise<T | null>;
    deleteOne(filter: FilterQuery<T>): Promise<T | null>;
    deleteMany(filter: FilterQuery<T>): Promise<{
        acknowledged: boolean;
        deletedCount: number;
    }>;
    count(filter?: FilterQuery<T>): Promise<number>;
    exists(filter: FilterQuery<T>): Promise<boolean>;
    aggregate(pipeline: any[]): Promise<any[]>;
    search(searchTerm: string, searchFields: string[], filter?: FilterQuery<T>, options?: PaginationOptions): Promise<PaginationResult<T>>;
    softDelete(id: string | Types.ObjectId, deletedBy?: Types.ObjectId): Promise<T | null>;
    restore(id: string | Types.ObjectId): Promise<T | null>;
    findActive(filter?: FilterQuery<T>): Promise<T[]>;
    findArchived(filter?: FilterQuery<T>): Promise<T[]>;
    withTransaction<R>(operation: (session: any) => Promise<R>): Promise<R>;
    bulkWrite(operations: any[]): Promise<any>;
    createIndex(indexSpec: any, options?: any): Promise<string>;
    dropIndex(indexName: string): Promise<any>;
    getIndexes(): Promise<any>;
}
