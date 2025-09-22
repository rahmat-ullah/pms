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
exports.AuditComplianceReportDto = exports.CreateAuditLogDto = exports.AuditListResponseDto = exports.AuditStatsResponseDto = exports.AuditResponseDto = exports.AuditStatsDto = exports.AuditLogDto = exports.AuditQueryDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const audit_log_schema_1 = require("../../database/schemas/audit-log.schema");
class AuditQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'timestamp';
        this.sortOrder = 'desc';
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: false, type: () => Number, default: 1, minimum: 1 }, limit: { required: false, type: () => Number, default: 10, minimum: 1 }, userId: { required: false, type: () => String }, userEmail: { required: false, type: () => String }, action: { required: false, enum: require("../../database/schemas/audit-log.schema").AuditAction }, entityType: { required: false, enum: require("../../database/schemas/audit-log.schema").AuditEntityType }, entityId: { required: false, type: () => String }, ipAddress: { required: false, type: () => String }, startDate: { required: false, type: () => String }, endDate: { required: false, type: () => String }, search: { required: false, type: () => String }, sortBy: { required: false, type: () => String, default: "timestamp" }, sortOrder: { required: false, type: () => Object, default: "desc" } };
    }
}
exports.AuditQueryDto = AuditQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AuditQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AuditQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439011' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'user@example.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "userEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: audit_log_schema_1.AuditAction }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(audit_log_schema_1.AuditAction),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: audit_log_schema_1.AuditEntityType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(audit_log_schema_1.AuditEntityType),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439011' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '192.168.1.1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2023-01-01T00:00:00.000Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2023-12-31T23:59:59.999Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'user' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'timestamp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'desc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AuditQueryDto.prototype, "sortOrder", void 0);
class AuditLogDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, userId: { required: true, type: () => String }, userEmail: { required: true, type: () => String }, action: { required: true, enum: require("../../database/schemas/audit-log.schema").AuditAction }, entityType: { required: true, enum: require("../../database/schemas/audit-log.schema").AuditEntityType }, entityId: { required: true, type: () => String }, oldValues: { required: false, type: () => Object }, newValues: { required: false, type: () => Object }, ipAddress: { required: true, type: () => String }, userAgent: { required: true, type: () => String }, metadata: { required: false, type: () => Object }, timestamp: { required: true, type: () => Date } };
    }
}
exports.AuditLogDto = AuditLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], AuditLogDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], AuditLogDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john.doe@example.com' }),
    __metadata("design:type", String)
], AuditLogDto.prototype, "userEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: audit_log_schema_1.AuditAction }),
    __metadata("design:type", String)
], AuditLogDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: audit_log_schema_1.AuditEntityType }),
    __metadata("design:type", String)
], AuditLogDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], AuditLogDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { name: 'John Doe', email: 'john.doe@example.com' } }),
    __metadata("design:type", Object)
], AuditLogDto.prototype, "oldValues", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { name: 'John Smith', email: 'john.smith@example.com' } }),
    __metadata("design:type", Object)
], AuditLogDto.prototype, "newValues", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '192.168.1.1' }),
    __metadata("design:type", String)
], AuditLogDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }),
    __metadata("design:type", String)
], AuditLogDto.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { requestId: 'req-123', sessionId: 'sess-456' } }),
    __metadata("design:type", Object)
], AuditLogDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], AuditLogDto.prototype, "timestamp", void 0);
class AuditStatsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { totalLogs: { required: true, type: () => Number }, actionCounts: { required: true, type: () => Object }, entityCounts: { required: true, type: () => Object }, uniqueUsers: { required: true, type: () => Number }, oldestLog: { required: true, type: () => Date }, newestLog: { required: true, type: () => Date }, averageLogsPerDay: { required: true, type: () => Number } };
    }
}
exports.AuditStatsDto = AuditStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000 }),
    __metadata("design:type", Number)
], AuditStatsDto.prototype, "totalLogs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { [audit_log_schema_1.AuditAction.CREATE]: 300, [audit_log_schema_1.AuditAction.UPDATE]: 500 } }),
    __metadata("design:type", Object)
], AuditStatsDto.prototype, "actionCounts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { [audit_log_schema_1.AuditEntityType.USER]: 400, [audit_log_schema_1.AuditEntityType.PROJECT]: 300 } }),
    __metadata("design:type", Object)
], AuditStatsDto.prototype, "entityCounts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50 }),
    __metadata("design:type", Number)
], AuditStatsDto.prototype, "uniqueUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], AuditStatsDto.prototype, "oldestLog", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-12-31T23:59:59.999Z' }),
    __metadata("design:type", Date)
], AuditStatsDto.prototype, "newestLog", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10.5 }),
    __metadata("design:type", Number)
], AuditStatsDto.prototype, "averageLogsPerDay", void 0);
class AuditResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, action: { required: true, enum: require("../../database/schemas/audit-log.schema").AuditAction }, entityType: { required: true, enum: require("../../database/schemas/audit-log.schema").AuditEntityType }, entityId: { required: true, type: () => String }, userId: { required: false, type: () => String }, userEmail: { required: false, type: () => String }, ipAddress: { required: false, type: () => String }, userAgent: { required: false, type: () => String }, timestamp: { required: true, type: () => Date }, changes: { required: false, type: () => Object }, oldValues: { required: false, type: () => Object }, newValues: { required: false, type: () => Object }, metadata: { required: false, type: () => Object }, user: { required: false, type: () => ({ id: { required: true, type: () => String }, email: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, fullName: { required: true, type: () => String } }) } };
    }
}
exports.AuditResponseDto = AuditResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], AuditResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: audit_log_schema_1.AuditAction }),
    __metadata("design:type", String)
], AuditResponseDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: audit_log_schema_1.AuditEntityType }),
    __metadata("design:type", String)
], AuditResponseDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], AuditResponseDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], AuditResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'user@example.com' }),
    __metadata("design:type", String)
], AuditResponseDto.prototype, "userEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '192.168.1.1' }),
    __metadata("design:type", String)
], AuditResponseDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mozilla/5.0...' }),
    __metadata("design:type", String)
], AuditResponseDto.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-15T00:00:00.000Z' }),
    __metadata("design:type", Date)
], AuditResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], AuditResponseDto.prototype, "changes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], AuditResponseDto.prototype, "oldValues", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], AuditResponseDto.prototype, "newValues", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], AuditResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], AuditResponseDto.prototype, "user", void 0);
class AuditStatsResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { totalLogs: { required: true, type: () => Number }, actionStats: { required: true }, entityTypeStats: { required: true }, topUsers: { required: true }, dailyActivity: { required: true } };
    }
}
exports.AuditStatsResponseDto = AuditStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000 }),
    __metadata("design:type", Number)
], AuditStatsResponseDto.prototype, "totalLogs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object] }),
    __metadata("design:type", Array)
], AuditStatsResponseDto.prototype, "actionStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object] }),
    __metadata("design:type", Array)
], AuditStatsResponseDto.prototype, "entityTypeStats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object] }),
    __metadata("design:type", Array)
], AuditStatsResponseDto.prototype, "topUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object] }),
    __metadata("design:type", Array)
], AuditStatsResponseDto.prototype, "dailyActivity", void 0);
class AuditListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { data: { required: true, type: () => [require("./audit.dto").AuditLogDto] }, total: { required: true, type: () => Number }, page: { required: true, type: () => Number }, limit: { required: true, type: () => Number }, totalPages: { required: true, type: () => Number }, hasNextPage: { required: true, type: () => Boolean }, hasPrevPage: { required: true, type: () => Boolean } };
    }
}
exports.AuditListResponseDto = AuditListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AuditLogDto] }),
    __metadata("design:type", Array)
], AuditListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    __metadata("design:type", Number)
], AuditListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], AuditListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    __metadata("design:type", Number)
], AuditListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    __metadata("design:type", Number)
], AuditListResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], AuditListResponseDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], AuditListResponseDto.prototype, "hasPrevPage", void 0);
class CreateAuditLogDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => String }, userEmail: { required: true, type: () => String }, action: { required: true, enum: require("../../database/schemas/audit-log.schema").AuditAction }, entityType: { required: true, enum: require("../../database/schemas/audit-log.schema").AuditEntityType }, entityId: { required: true, type: () => String }, oldValues: { required: false, type: () => Object }, newValues: { required: false, type: () => Object }, ipAddress: { required: true, type: () => String }, userAgent: { required: true, type: () => String }, metadata: { required: false, type: () => Object } };
    }
}
exports.CreateAuditLogDto = CreateAuditLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditLogDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john.doe@example.com' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditLogDto.prototype, "userEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: audit_log_schema_1.AuditAction }),
    (0, class_validator_1.IsEnum)(audit_log_schema_1.AuditAction),
    __metadata("design:type", String)
], CreateAuditLogDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: audit_log_schema_1.AuditEntityType }),
    (0, class_validator_1.IsEnum)(audit_log_schema_1.AuditEntityType),
    __metadata("design:type", String)
], CreateAuditLogDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditLogDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { name: 'John Doe' } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAuditLogDto.prototype, "oldValues", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { name: 'John Smith' } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAuditLogDto.prototype, "newValues", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '192.168.1.1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditLogDto.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditLogDto.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { requestId: 'req-123' } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAuditLogDto.prototype, "metadata", void 0);
class AuditComplianceReportDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { startDate: { required: true, type: () => Date }, endDate: { required: true, type: () => Date }, totalActivities: { required: true, type: () => Number }, uniqueUsers: { required: true, type: () => Number }, actionBreakdown: { required: true, type: () => Object }, entityBreakdown: { required: true, type: () => Object }, topIpAddresses: { required: true, type: () => [String] }, mostActiveUsers: { required: true, type: () => [String] }, averageActivitiesPerDay: { required: true, type: () => Number }, securityEvents: { required: true, type: () => Object } };
    }
}
exports.AuditComplianceReportDto = AuditComplianceReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], AuditComplianceReportDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-12-31T23:59:59.999Z' }),
    __metadata("design:type", Date)
], AuditComplianceReportDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5000 }),
    __metadata("design:type", Number)
], AuditComplianceReportDto.prototype, "totalActivities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150 }),
    __metadata("design:type", Number)
], AuditComplianceReportDto.prototype, "uniqueUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { [audit_log_schema_1.AuditAction.CREATE]: 1000, [audit_log_schema_1.AuditAction.UPDATE]: 2000 } }),
    __metadata("design:type", Object)
], AuditComplianceReportDto.prototype, "actionBreakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { [audit_log_schema_1.AuditEntityType.USER]: 1500, [audit_log_schema_1.AuditEntityType.PROJECT]: 2000 } }),
    __metadata("design:type", Object)
], AuditComplianceReportDto.prototype, "entityBreakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['192.168.1.1', '192.168.1.2'] }),
    __metadata("design:type", Array)
], AuditComplianceReportDto.prototype, "topIpAddresses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['john.doe@example.com', 'jane.smith@example.com'] }),
    __metadata("design:type", Array)
], AuditComplianceReportDto.prototype, "mostActiveUsers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25.5 }),
    __metadata("design:type", Number)
], AuditComplianceReportDto.prototype, "averageActivitiesPerDay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { suspicious: 5, failed: 10 } }),
    __metadata("design:type", Object)
], AuditComplianceReportDto.prototype, "securityEvents", void 0);
//# sourceMappingURL=audit.dto.js.map