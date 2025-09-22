"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSeeder = void 0;
const common_1 = require("@nestjs/common");
class BaseSeeder {
    constructor(model) {
        this.model = model;
        this.logger = new common_1.Logger(this.constructor.name);
    }
    async seed() {
        try {
            const collectionName = this.getCollectionName();
            this.logger.log(`Starting to seed ${collectionName}...`);
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
            const batchSize = 100;
            let insertedCount = 0;
            for (let i = 0; i < data.length; i += batchSize) {
                const batch = data.slice(i, i + batchSize);
                await this.model.insertMany(batch);
                insertedCount += batch.length;
                this.logger.log(`Inserted ${insertedCount}/${data.length} documents for ${collectionName}`);
            }
            this.logger.log(`Successfully seeded ${insertedCount} documents for ${collectionName}`);
        }
        catch (error) {
            this.logger.error(`Failed to seed ${this.getCollectionName()}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async clear() {
        try {
            const collectionName = this.getCollectionName();
            this.logger.log(`Clearing ${collectionName}...`);
            const result = await this.model.deleteMany({});
            this.logger.log(`Cleared ${result.deletedCount} documents from ${collectionName}`);
        }
        catch (error) {
            this.logger.error(`Failed to clear ${this.getCollectionName()}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async reseed() {
        await this.clear();
        await this.seed();
    }
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    randomChoices(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    }
    randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
    randomBoolean(probability = 0.5) {
        return Math.random() < probability;
    }
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
exports.BaseSeeder = BaseSeeder;
//# sourceMappingURL=base.seeder.js.map