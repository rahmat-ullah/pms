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
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let HealthService = HealthService_1 = class HealthService {
    constructor(configService, mongoConnection) {
        this.configService = configService;
        this.mongoConnection = mongoConnection;
        this.logger = new common_1.Logger(HealthService_1.name);
    }
    async getHealthStatus() {
        const timestamp = new Date().toISOString();
        const uptime = process.uptime();
        const environment = this.configService.get('NODE_ENV');
        const version = this.configService.get('APP_VERSION');
        try {
            const dbStatus = await this.checkDatabaseHealth();
            const memoryUsage = this.getMemoryUsage();
            return {
                status: 'ok',
                timestamp,
                uptime,
                environment,
                version,
                database: dbStatus,
                memory: memoryUsage,
            };
        }
        catch (error) {
            this.logger.error('Health check failed:', error);
            throw new Error('Service unavailable');
        }
    }
    async getDetailedHealthStatus() {
        const basicHealth = await this.getHealthStatus();
        return {
            ...basicHealth,
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                pid: process.pid,
                cpuUsage: process.cpuUsage(),
            },
            database: {
                ...basicHealth.database,
                readyState: this.mongoConnection.readyState,
                host: this.mongoConnection.host,
                port: this.mongoConnection.port,
                name: this.mongoConnection.name,
            },
        };
    }
    async checkDatabaseHealth() {
        const startTime = Date.now();
        try {
            await this.mongoConnection.db.admin().ping();
            const responseTime = Date.now() - startTime;
            return {
                status: 'connected',
                responseTime,
            };
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            return {
                status: 'disconnected',
                responseTime: Date.now() - startTime,
                error: error.message,
            };
        }
    }
    getMemoryUsage() {
        const memUsage = process.memoryUsage();
        return {
            used: memUsage.heapUsed,
            total: memUsage.heapTotal,
            percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
            rss: memUsage.rss,
            external: memUsage.external,
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mongoose_2.Connection])
], HealthService);
//# sourceMappingURL=health.service.js.map