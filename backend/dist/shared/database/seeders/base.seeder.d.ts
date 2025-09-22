import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
export declare abstract class BaseSeeder<T> {
    protected readonly model: Model<T>;
    protected readonly logger: Logger;
    constructor(model: Model<T>);
    abstract getData(): Promise<Partial<T>[]>;
    abstract getCollectionName(): string;
    seed(): Promise<void>;
    clear(): Promise<void>;
    reseed(): Promise<void>;
    protected generateId(): string;
    protected randomChoice<T>(array: T[]): T;
    protected randomChoices<T>(array: T[], count: number): T[];
    protected randomDate(start: Date, end: Date): Date;
    protected randomBoolean(probability?: number): boolean;
    protected randomNumber(min: number, max: number): number;
}
