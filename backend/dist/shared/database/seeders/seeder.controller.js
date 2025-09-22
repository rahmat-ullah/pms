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
exports.SeederController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const database_seeder_1 = require("./database.seeder");
let SeederController = class SeederController {
    constructor(databaseSeeder) {
        this.databaseSeeder = databaseSeeder;
    }
    async getStatus() {
        try {
            const status = await this.databaseSeeder.getSeederStatus();
            return {
                success: true,
                data: status,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to get seeder status',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async seedAll() {
        try {
            await this.databaseSeeder.seedAll();
            return {
                success: true,
                message: 'All collections seeded successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to seed collections',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async clearAll() {
        try {
            await this.databaseSeeder.clearAll();
            return {
                success: true,
                message: 'All collections cleared successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to clear collections',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async reseedAll() {
        try {
            await this.databaseSeeder.reseedAll();
            return {
                success: true,
                message: 'All collections reseeded successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to reseed collections',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async seedUsers() {
        try {
            await this.databaseSeeder.seedUsers();
            return {
                success: true,
                message: 'Users collection seeded successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to seed users collection',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async seedEmployees() {
        try {
            await this.databaseSeeder.seedEmployees();
            return {
                success: true,
                message: 'Employees collection seeded successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to seed employees collection',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async clearUsers() {
        try {
            await this.databaseSeeder.clearUsers();
            return {
                success: true,
                message: 'Users collection cleared successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to clear users collection',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async clearEmployees() {
        try {
            await this.databaseSeeder.clearEmployees();
            return {
                success: true,
                message: 'Employees collection cleared successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to clear employees collection',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async reseedUsers() {
        try {
            await this.databaseSeeder.reseedUsers();
            return {
                success: true,
                message: 'Users collection reseeded successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to reseed users collection',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async reseedEmployees() {
        try {
            await this.databaseSeeder.reseedEmployees();
            return {
                success: true,
                message: 'Employees collection reseeded successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to reseed employees collection',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SeederController = SeederController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get seeder status' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Seeder status retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeederController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('seed-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Seed all collections' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'All collections seeded successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeederController.prototype, "seedAll", null);
__decorate([
    (0, common_1.Delete)('clear-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all collections' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'All collections cleared successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeederController.prototype, "clearAll", null);
__decorate([
    (0, common_1.Post)('reseed-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear and reseed all collections' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'All collections reseeded successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeederController.prototype, "reseedAll", null);
__decorate([
    (0, common_1.Post)('seed-users'),
    (0, swagger_1.ApiOperation)({ summary: 'Seed users collection' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Users collection seeded successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeederController.prototype, "seedUsers", null);
__decorate([
    (0, common_1.Post)('seed-employees'),
    (0, swagger_1.ApiOperation)({ summary: 'Seed employees collection' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Employees collection seeded successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeederController.prototype, "seedEmployees", null);
__decorate([
    (0, common_1.Delete)('clear-users'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear users collection' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Users collection cleared successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeederController.prototype, "clearUsers", null);
__decorate([
    (0, common_1.Delete)('clear-employees'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear employees collection' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Employees collection cleared successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeederController.prototype, "clearEmployees", null);
__decorate([
    (0, common_1.Post)('reseed-users'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear and reseed users collection' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Users collection reseeded successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeederController.prototype, "reseedUsers", null);
__decorate([
    (0, common_1.Post)('reseed-employees'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear and reseed employees collection' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Employees collection reseeded successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeederController.prototype, "reseedEmployees", null);
exports.SeederController = SeederController = __decorate([
    (0, swagger_1.ApiTags)('Database Seeding'),
    (0, common_1.Controller)('api/v1/seeder'),
    __metadata("design:paramtypes", [database_seeder_1.DatabaseSeeder])
], SeederController);
//# sourceMappingURL=seeder.controller.js.map