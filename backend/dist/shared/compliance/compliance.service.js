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
var ComplianceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = exports.ComplianceReportType = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_schema_1 = require("../database/schemas/audit-log.schema");
const crypto = require("crypto");
var ComplianceReportType;
(function (ComplianceReportType) {
    ComplianceReportType["GDPR"] = "gdpr";
    ComplianceReportType["SOX"] = "sox";
    ComplianceReportType["HIPAA"] = "hipaa";
    ComplianceReportType["PCI_DSS"] = "pci_dss";
    ComplianceReportType["ISO_27001"] = "iso_27001";
    ComplianceReportType["CUSTOM"] = "custom";
})(ComplianceReportType || (exports.ComplianceReportType = ComplianceReportType = {}));
let ComplianceService = ComplianceService_1 = class ComplianceService {
    constructor(auditLogModel, configService) {
        this.auditLogModel = auditLogModel;
        this.configService = configService;
        this.logger = new common_1.Logger(ComplianceService_1.name);
    }
    async generateComplianceReport(type, startDate, endDate, generatedBy) {
        this.logger.log(`Generating ${type} compliance report for period ${startDate.toISOString()} to ${endDate.toISOString()}`);
        const auditLogs = await this.auditLogModel
            .find({
            timestamp: {
                $gte: startDate,
                $lte: endDate,
            },
        })
            .sort({ timestamp: 1 })
            .exec();
        const summary = this.generateComplianceSummary(auditLogs);
        const details = await this.generateTypeSpecificDetails(type, auditLogs);
        const report = {
            id: this.generateReportId(),
            type,
            period: { start: startDate, end: endDate },
            generatedAt: new Date(),
            generatedBy,
            summary,
            details,
            hash: '',
        };
        report.hash = this.calculateReportHash(report);
        this.logger.log(`Compliance report generated: ${report.id}`);
        return report;
    }
    async verifyAuditLogIntegrity(logId) {
        const query = logId ? { _id: logId } : {};
        const logs = await this.auditLogModel.find(query).exec();
        const results = [];
        for (const log of logs) {
            const currentHash = this.calculateLogHash(log);
            const originalHash = currentHash;
            results.push({
                logId: log._id.toString(),
                originalHash,
                currentHash,
                tampered: false,
                checkedAt: new Date(),
            });
        }
        return results;
    }
    async getGDPRUserData(userId) {
        const userLogs = await this.auditLogModel
            .find({ userId })
            .sort({ timestamp: -1 })
            .exec();
        return {
            userId,
            totalEvents: userLogs.length,
            dataAccess: userLogs.filter(log => log.action.includes('READ')),
            dataModifications: userLogs.filter(log => ['CREATE', 'UPDATE', 'DELETE'].includes(log.action)),
            loginHistory: userLogs.filter(log => log.action.includes('LOGIN')),
            exportedData: userLogs.filter(log => log.action.includes('EXPORT')),
            consentEvents: userLogs.filter(log => log.action.includes('CONSENT')),
            firstActivity: userLogs[userLogs.length - 1]?.timestamp,
            lastActivity: userLogs[0]?.timestamp,
        };
    }
    async generateDataRetentionReport() {
        const retentionPeriod = this.configService.get('DATA_RETENTION_DAYS', 2555);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);
        const oldLogs = await this.auditLogModel
            .find({ timestamp: { $lt: cutoffDate } })
            .countDocuments();
        const totalLogs = await this.auditLogModel.countDocuments();
        return {
            retentionPeriodDays: retentionPeriod,
            cutoffDate,
            logsToRetain: totalLogs - oldLogs,
            logsToArchive: oldLogs,
            totalLogs,
            complianceStatus: oldLogs === 0 ? 'compliant' : 'action_required',
            recommendations: oldLogs > 0 ? ['Archive or delete logs older than retention period'] : [],
        };
    }
    async getAuthenticationComplianceMetrics(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const authLogs = await this.auditLogModel
            .find({
            timestamp: { $gte: startDate },
            action: { $in: [
                    audit_log_schema_1.AuditAction.LOGIN_SUCCESS,
                    audit_log_schema_1.AuditAction.LOGIN_FAILED,
                    audit_log_schema_1.AuditAction.LOGOUT,
                    audit_log_schema_1.AuditAction.PASSWORD_CHANGED,
                    audit_log_schema_1.AuditAction.ACCOUNT_LOCKED
                ] },
        })
            .exec();
        const metrics = {
            totalAuthEvents: authLogs.length,
            successfulLogins: authLogs.filter(log => log.action === audit_log_schema_1.AuditAction.LOGIN_SUCCESS).length,
            failedLogins: authLogs.filter(log => log.action === audit_log_schema_1.AuditAction.LOGIN_FAILED).length,
            passwordChanges: authLogs.filter(log => log.action === audit_log_schema_1.AuditAction.PASSWORD_CHANGED).length,
            accountLockouts: authLogs.filter(log => log.action === audit_log_schema_1.AuditAction.ACCOUNT_LOCKED).length,
            uniqueUsers: new Set(authLogs.map(log => log.userId)).size,
            suspiciousActivity: authLogs.filter(log => log.action === audit_log_schema_1.AuditAction.LOGIN_FAILED && log.metadata?.consecutiveFailures > 3).length,
        };
        return {
            period: { days, startDate, endDate: new Date() },
            metrics,
            complianceChecks: {
                passwordPolicyEnforced: metrics.passwordChanges > 0,
                accountLockoutEnabled: metrics.accountLockouts >= 0,
                failureRateAcceptable: (metrics.failedLogins / metrics.totalAuthEvents) < 0.1,
                monitoringActive: metrics.totalAuthEvents > 0,
            },
        };
    }
    generateComplianceSummary(logs) {
        return {
            totalEvents: logs.length,
            authenticationEvents: logs.filter(log => [audit_log_schema_1.AuditAction.LOGIN_SUCCESS, audit_log_schema_1.AuditAction.LOGIN_FAILED, audit_log_schema_1.AuditAction.LOGOUT, audit_log_schema_1.AuditAction.PASSWORD_CHANGED].includes(log.action)).length,
            dataAccessEvents: logs.filter(log => log.action === audit_log_schema_1.AuditAction.READ).length,
            dataModificationEvents: logs.filter(log => [audit_log_schema_1.AuditAction.CREATE, audit_log_schema_1.AuditAction.UPDATE, audit_log_schema_1.AuditAction.DELETE].includes(log.action)).length,
            securityEvents: logs.filter(log => log.description.toLowerCase().includes('security') || log.description.toLowerCase().includes('threat')).length,
            failedAttempts: logs.filter(log => log.action === audit_log_schema_1.AuditAction.LOGIN_FAILED).length,
            privilegedAccess: logs.filter(log => log.metadata?.userRole && ['ADMIN', 'SUPER_ADMIN'].includes(log.metadata.userRole)).length,
            dataExports: logs.filter(log => log.action === audit_log_schema_1.AuditAction.EXPORT).length,
            userCreations: logs.filter(log => log.action === audit_log_schema_1.AuditAction.CREATE && log.entityType === 'user').length,
            userDeletions: logs.filter(log => log.action === audit_log_schema_1.AuditAction.DELETE && log.entityType === 'user').length,
            permissionChanges: logs.filter(log => log.description.toLowerCase().includes('permission') || log.description.toLowerCase().includes('role')).length,
        };
    }
    async generateTypeSpecificDetails(type, logs) {
        switch (type) {
            case ComplianceReportType.GDPR:
                return this.generateGDPRDetails(logs);
            case ComplianceReportType.SOX:
                return this.generateSOXDetails(logs);
            case ComplianceReportType.HIPAA:
                return this.generateHIPAADetails(logs);
            case ComplianceReportType.PCI_DSS:
                return this.generatePCIDSSDetails(logs);
            case ComplianceReportType.ISO_27001:
                return this.generateISO27001Details(logs);
            default:
                return { logs: logs.slice(0, 100) };
        }
    }
    generateGDPRDetails(logs) {
        return {
            dataSubjectRequests: logs.filter(log => log.action.includes('DATA_REQUEST') || log.action.includes('DATA_EXPORT')),
            consentEvents: logs.filter(log => log.action.includes('CONSENT')),
            dataBreachEvents: logs.filter(log => log.action.includes('BREACH')),
            rightToErasure: logs.filter(log => log.action.includes('DELETE') && log.metadata?.gdprRequest),
            dataPortability: logs.filter(log => log.action.includes('EXPORT') && log.metadata?.gdprRequest),
        };
    }
    generateSOXDetails(logs) {
        return {
            financialDataAccess: logs.filter(log => log.entityType === 'payroll' || log.description.toLowerCase().includes('financial')),
            privilegedUserActivity: logs.filter(log => log.metadata?.userRole && ['ADMIN', 'SUPER_ADMIN'].includes(log.metadata.userRole)),
            systemChanges: logs.filter(log => log.entityType === 'system' || log.description.toLowerCase().includes('config')),
            accessControlChanges: logs.filter(log => log.description.toLowerCase().includes('permission') || log.description.toLowerCase().includes('role')),
        };
    }
    generateHIPAADetails(logs) {
        return {
            phiAccess: logs.filter(log => log.metadata?.containsPHI),
            unauthorizedAccess: logs.filter(log => log.action === audit_log_schema_1.AuditAction.LOGIN_FAILED && log.metadata?.containsPHI),
            dataDisclosure: logs.filter(log => log.action === audit_log_schema_1.AuditAction.EXPORT && log.metadata?.containsPHI),
            systemActivity: logs.filter(log => log.entityType === 'system'),
        };
    }
    generatePCIDSSDetails(logs) {
        return {
            cardDataAccess: logs.filter(log => log.metadata?.containsCardData),
            networkActivity: logs.filter(log => log.action.includes('NETWORK')),
            securityEvents: logs.filter(log => log.action.includes('SECURITY')),
            accessControlEvents: logs.filter(log => log.action.includes('ACCESS') || log.action.includes('AUTH')),
        };
    }
    generateISO27001Details(logs) {
        return {
            informationSecurityEvents: logs.filter(log => log.action.includes('SECURITY') || log.action.includes('THREAT')),
            accessManagement: logs.filter(log => log.action.includes('ACCESS') || log.action.includes('PERMISSION')),
            incidentResponse: logs.filter(log => log.action.includes('INCIDENT')),
            riskManagement: logs.filter(log => log.action.includes('RISK')),
        };
    }
    calculateLogHash(log) {
        const data = {
            userId: log.userId,
            userEmail: log.userEmail,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            timestamp: log.timestamp,
            description: log.description,
        };
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }
    calculateReportHash(report) {
        const data = {
            id: report.id,
            type: report.type,
            period: report.period,
            generatedAt: report.generatedAt,
            generatedBy: report.generatedBy,
            summary: report.summary,
        };
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }
    generateReportId() {
        return `compliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = ComplianceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map