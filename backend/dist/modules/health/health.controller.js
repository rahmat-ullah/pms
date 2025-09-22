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
exports.HealthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const health_service_1 = require("./health.service");
let HealthController = class HealthController {
    constructor(healthService) {
        this.healthService = healthService;
    }
    async getHealth() {
        return this.healthService.getHealthStatus();
    }
    async getDetailedHealth() {
        return this.healthService.getDetailedHealthStatus();
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get application health status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Health check successful',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', format: 'date-time' },
                uptime: { type: 'number', example: 12345 },
                environment: { type: 'string', example: 'development' },
                version: { type: 'string', example: '1.0.0' },
                database: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'connected' },
                        responseTime: { type: 'number', example: 5 }
                    }
                },
                memory: {
                    type: 'object',
                    properties: {
                        used: { type: 'number', example: 123456789 },
                        total: { type: 'number', example: 987654321 },
                        percentage: { type: 'number', example: 12.5 }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service unavailable' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('detailed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed health information' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Detailed health check successful'
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getDetailedHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [health_service_1.HealthService])
], HealthController);
//# sourceMappingURL=health.controller.js.map