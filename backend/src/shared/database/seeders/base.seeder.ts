import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';

export abstract class BaseSeeder<T> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly model: Model<T>) {}

  abstract getData(): Promise<Partial<T>[]>;
  abstract getCollectionName(): string;

  async seed(): Promise<void> {
    try {
      const collectionName = this.getCollectionName();
      this.logger.log(`Starting to seed ${collectionName}...`);

      // Check if collection already has data
      const existingCount = await this.model.countDocuments();
      if (existingCount > 0) {
        this.logger.warn(`${collectionName} already has ${existingCount} documents. Skipping seeding.`);
        return;
      }

      const data = await this.getData();
      if (data.length === 0) {
        this.logger.warn(`No data to seed for ${collectionName}`);
        return;
      }

      // Insert data in batches to avoid memory issues
      const batchSize = 100;
      let insertedCount = 0;

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await this.model.insertMany(batch);
        insertedCount += batch.length;
        this.logger.log(`Inserted ${insertedCount}/${data.length} documents for ${collectionName}`);
      }

      this.logger.log(`Successfully seeded ${insertedCount} documents for ${collectionName}`);
    } catch (error) {
      this.logger.error(`Failed to seed ${this.getCollectionName()}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const collectionName = this.getCollectionName();
      this.logger.log(`Clearing ${collectionName}...`);
      
      const result = await this.model.deleteMany({});
      this.logger.log(`Cleared ${result.deletedCount} documents from ${collectionName}`);
    } catch (error) {
      this.logger.error(`Failed to clear ${this.getCollectionName()}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async reseed(): Promise<void> {
    await this.clear();
    await this.seed();
  }

  protected generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  protected randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  protected randomChoices<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  protected randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  protected randomBoolean(probability: number = 0.5): boolean {
    return Math.random() < probability;
  }

  protected randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
