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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../modules/auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../modules/auth/guards/roles.guard");
const roles_decorator_1 = require("../../modules/auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../../modules/auth/decorators/current-user.decorator");
const audit_service_1 = require("./audit.service");
const audit_dto_1 = require("./dto/audit.dto");
const user_schema_1 = require("../database/schemas/user.schema");
const audit_log_schema_1 = require("../database/schemas/audit-log.schema");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async findAll(query) {
        return this.auditService.findAll(query);
    }
    async getAuditStats(startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.auditService.getAuditStats(start, end);
    }
    async getComplianceReport(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return this.auditService.getComplianceReport(start, end);
    }
    async findByEntityId(entityId, entityType) {
        return this.auditService.findByEntityId(entityId, entityType);
    }
    async findByUserId(userId, query) {
        return this.auditService.findByUserId(userId, query);
    }
    async getMyActivity(currentUser, query) {
        return this.auditService.findByUserId(currentUser.id, query);
    }
    async findById(id) {
        return this.auditService.findById(id);
    }
    async cleanupOldLogs(retentionDays = 365) {
        const result = await this.auditService.cleanupOldLogs(retentionDays);
        return {
            ...result,
            message: `Successfully deleted ${result.deletedCount} old audit logs`,
        };
    }
    async exportToCsv(query) {
        const exportQuery = { ...query, limit: 10000, page: 1 };
        const { auditLogs } = await this.auditService.findAll(exportQuery);
        const csvHeaders = [
            'ID',
            'Timestamp',
            'Action',
            'Entity Type',
            'Entity ID',
            'User Email',
            'IP Address',
            'User Agent',
            'Changes',
        ];
        const csvRows = auditLogs.map(log => [
            log.id,
            log.timestamp.toISOString(),
            log.action,
            log.entityType,
            log.entityId,
            log.userEmail || '',
            log.ipAddress || '',
            log.userAgent || '',
            JSON.stringify(log.changes || {}),
        ]);
        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.map(field => `"${field}"`).join(',')),
        ].join('\n');
        return {
            content: csvContent,
            filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
            contentType: 'text/csv',
        };
    }
    async getDashboardSummary() {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [weeklyStats, monthlyStats] = await Promise.all([
            this.auditService.getAuditStats(lastWeek, today),
            this.auditService.getAuditStats(lastMonth, today),
        ]);
        return {
            weekly: weeklyStats,
            monthly: monthlyStats,
            summary: {
                weeklyTotal: weeklyStats.totalLogs,
                monthlyTotal: monthlyStats.totalLogs,
                weeklyGrowth: weeklyStats.totalLogs,
                monthlyGrowth: monthlyStats.totalLogs,
            },
        };
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.AUDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all audit logs with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Audit logs retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                auditLogs: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AuditResponseDto' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.AUDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit statistics' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, description: 'Start date for statistics (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: String, description: 'End date for statistics (ISO string)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Audit statistics retrieved successfully',
        type: audit_dto_1.AuditStatsResponseDto,
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/audit.dto").AuditStatsResponseDto }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditStats", null);
__decorate([
    (0, common_1.Get)('compliance-report'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.AUDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Generate compliance report for a date range' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, type: String, description: 'Start date for report (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, type: String, description: 'End date for report (ISO string)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Compliance report generated successfully',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getComplianceReport", null);
__decorate([
    (0, common_1.Get)('entity/:entityId'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.AUDITOR, user_schema_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs for a specific entity' }),
    (0, swagger_1.ApiParam)({ name: 'entityId', description: 'Entity ID to get audit logs for' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', required: false, enum: audit_log_schema_1.AuditEntityType, description: 'Entity type filter' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Entity audit logs retrieved successfully',
        type: [audit_dto_1.AuditResponseDto],
    }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/audit.dto").AuditResponseDto] }),
    __param(0, (0, common_1.Param)('entityId')),
    __param(1, (0, common_1.Query)('entityType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findByEntityId", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.AUDITOR, user_schema_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs for a specific user' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID to get audit logs for' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'User audit logs retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                auditLogs: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AuditResponseDto' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, audit_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Get)('my-activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user\'s audit logs' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Current user audit logs retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                auditLogs: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AuditResponseDto' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, audit_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getMyActivity", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.AUDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit log by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Audit log ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Audit log retrieved successfully',
        type: audit_dto_1.AuditResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Audit log not found',
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/audit.dto").AuditResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Clean up old audit logs' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Old audit logs cleaned up successfully',
        schema: {
            type: 'object',
            properties: {
                deletedCount: { type: 'number' },
                message: { type: 'string' },
            },
        },
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)('retentionDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "cleanupOldLogs", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.AUDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Export audit logs to CSV' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Audit logs exported successfully',
        headers: {
            'Content-Type': {
                description: 'text/csv',
            },
            'Content-Disposition': {
                description: 'attachment; filename="audit-logs.csv"',
            },
        },
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_dto_1.AuditQueryDto]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "exportToCsv", null);
__decorate([
    (0, common_1.Get)('dashboard/summary'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.AUDITOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit dashboard summary' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Audit dashboard summary retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getDashboardSummary", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('audit'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('audit'),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map