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
var DatabaseSeeder_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSeeder = void 0;
const common_1 = require("@nestjs/common");
const user_seeder_1 = require("./user.seeder");
const employee_seeder_1 = require("./employee.seeder");
let DatabaseSeeder = DatabaseSeeder_1 = class DatabaseSeeder {
    constructor(userSeeder, employeeSeeder) {
        this.userSeeder = userSeeder;
        this.employeeSeeder = employeeSeeder;
        this.logger = new common_1.Logger(DatabaseSeeder_1.name);
    }
    async seedAll() {
        try {
            this.logger.log('Starting database seeding...');
            await this.userSeeder.seed();
            await this.employeeSeeder.seed();
            this.logger.log('Database seeding completed successfully!');
        }
        catch (error) {
            this.logger.error('Database seeding failed:', error.message);
            throw error;
        }
    }
    async clearAll() {
        try {
            this.logger.log('Starting database clearing...');
            await this.employeeSeeder.clear();
            await this.userSeeder.clear();
            this.logger.log('Database clearing completed successfully!');
        }
        catch (error) {
            this.logger.error('Database clearing failed:', error.message);
            throw error;
        }
    }
    async reseedAll() {
        await this.clearAll();
        await this.seedAll();
    }
    async seedUsers() {
        await this.userSeeder.seed();
    }
    async seedEmployees() {
        await this.employeeSeeder.seed();
    }
    async clearUsers() {
        await this.userSeeder.clear();
    }
    async clearEmployees() {
        await this.employeeSeeder.clear();
    }
    async reseedUsers() {
        await this.userSeeder.reseed();
    }
    async reseedEmployees() {
        await this.employeeSeeder.reseed();
    }
    async getSeederStatus() {
        return {
            users: {
                hasData: await this.userSeeder['model'].countDocuments() > 0,
                count: await this.userSeeder['model'].countDocuments(),
            },
            employees: {
                hasData: await this.employeeSeeder['model'].countDocuments() > 0,
                count: await this.employeeSeeder['model'].countDocuments(),
            },
        };
    }
};
exports.DatabaseSeeder = DatabaseSeeder;
exports.DatabaseSeeder = DatabaseSeeder = DatabaseSeeder_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_seeder_1.UserSeeder,
        employee_seeder_1.EmployeeSeeder])
], DatabaseSeeder);
//# sourceMappingURL=database.seeder.js.map