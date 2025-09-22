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
var SecurityMonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityMonitoringService = exports.ThreatSeverity = exports.ThreatType = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_schema_1 = require("../database/schemas/audit-log.schema");
var ThreatType;
(function (ThreatType) {
    ThreatType["BRUTE_FORCE"] = "brute_force";
    ThreatType["SQL_INJECTION"] = "sql_injection";
    ThreatType["XSS_ATTEMPT"] = "xss_attempt";
    ThreatType["PATH_TRAVERSAL"] = "path_traversal";
    ThreatType["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    ThreatType["RATE_LIMIT_EXCEEDED"] = "rate_limit_exceeded";
    ThreatType["UNAUTHORIZED_ACCESS"] = "unauthorized_access";
    ThreatType["DATA_BREACH_ATTEMPT"] = "data_breach_attempt";
    ThreatType["MALICIOUS_FILE_UPLOAD"] = "malicious_file_upload";
    ThreatType["PRIVILEGE_ESCALATION"] = "privilege_escalation";
})(ThreatType || (exports.ThreatType = ThreatType = {}));
var ThreatSeverity;
(function (ThreatSeverity) {
    ThreatSeverity["LOW"] = "low";
    ThreatSeverity["MEDIUM"] = "medium";
    ThreatSeverity["HIGH"] = "high";
    ThreatSeverity["CRITICAL"] = "critical";
})(ThreatSeverity || (exports.ThreatSeverity = ThreatSeverity = {}));
let SecurityMonitoringService = SecurityMonitoringService_1 = class SecurityMonitoringService {
    constructor(auditLogModel, configService) {
        this.auditLogModel = auditLogModel;
        this.configService = configService;
        this.logger = new common_1.Logger(SecurityMonitoringService_1.name);
        this.threats = new Map();
        this.suspiciousIPs = new Map();
        this.alertThresholds = {
            [ThreatType.BRUTE_FORCE]: 5,
            [ThreatType.SQL_INJECTION]: 1,
            [ThreatType.XSS_ATTEMPT]: 1,
            [ThreatType.PATH_TRAVERSAL]: 1,
            [ThreatType.SUSPICIOUS_ACTIVITY]: 10,
            [ThreatType.RATE_LIMIT_EXCEEDED]: 20,
            [ThreatType.UNAUTHORIZED_ACCESS]: 3,
            [ThreatType.DATA_BREACH_ATTEMPT]: 1,
            [ThreatType.MALICIOUS_FILE_UPLOAD]: 1,
            [ThreatType.PRIVILEGE_ESCALATION]: 1,
        };
        setInterval(() => {
            this.cleanupOldThreats();
        }, 60 * 60 * 1000);
    }
    async reportThreat(type, source, description, metadata = {}, severity) {
        const threatId = this.generateThreatId();
        const calculatedSeverity = severity || this.calculateSeverity(type, metadata);
        const threat = {
            id: threatId,
            type,
            severity: calculatedSeverity,
            source,
            description,
            timestamp: new Date(),
            metadata,
            resolved: false,
        };
        this.threats.set(threatId, threat);
        this.trackSuspiciousIP(source, type);
        this.logger.warn(`Security threat detected: ${type} from ${source} - ${description}`, {
            threatId,
            severity: calculatedSeverity,
            metadata,
        });
        await this.checkAutomatedResponse(threat);
        await this.logSecurityEvent(threat);
        return threat;
    }
    async getSecurityMetrics(timeframe = 'day') {
        const now = new Date();
        const startTime = this.getTimeframeStart(now, timeframe);
        const recentThreats = Array.from(this.threats.values())
            .filter(threat => threat.timestamp >= startTime);
        const threatsByType = {};
        const threatsBySeverity = {};
        const sourceCounts = new Map();
        Object.values(ThreatType).forEach(type => threatsByType[type] = 0);
        Object.values(ThreatSeverity).forEach(severity => threatsBySeverity[severity] = 0);
        recentThreats.forEach(threat => {
            threatsByType[threat.type]++;
            threatsBySeverity[threat.severity]++;
            const count = sourceCounts.get(threat.source) || 0;
            sourceCounts.set(threat.source, count + 1);
        });
        const topSources = Array.from(sourceCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([source, count]) => ({ source, count }));
        const resolvedThreats = recentThreats.filter(t => t.resolved).length;
        const resolutionTimes = recentThreats
            .filter(t => t.resolved && t.resolvedAt)
            .map(t => t.resolvedAt.getTime() - t.timestamp.getTime());
        const averageResolutionTime = resolutionTimes.length > 0
            ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
            : 0;
        return {
            totalThreats: this.threats.size,
            threatsToday: recentThreats.length,
            threatsByType,
            threatsBySeverity,
            topSources,
            resolvedThreats,
            averageResolutionTime: Math.round(averageResolutionTime / 1000),
        };
    }
    getActiveThreats(severity) {
        return Array.from(this.threats.values())
            .filter(threat => !threat.resolved)
            .filter(threat => !severity || threat.severity === severity)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    async resolveThreat(threatId, resolvedBy) {
        const threat = this.threats.get(threatId);
        if (!threat) {
            return false;
        }
        threat.resolved = true;
        threat.resolvedAt = new Date();
        threat.resolvedBy = resolvedBy;
        this.threats.set(threatId, threat);
        this.logger.log(`Security threat resolved: ${threatId} by ${resolvedBy}`);
        await this.logSecurityEvent(threat, 'THREAT_RESOLVED');
        return true;
    }
    shouldBlockIP(ip) {
        const ipInfo = this.suspiciousIPs.get(ip);
        if (!ipInfo)
            return false;
        const criticalThreats = ipInfo.threats.filter(type => [ThreatType.SQL_INJECTION, ThreatType.XSS_ATTEMPT, ThreatType.DATA_BREACH_ATTEMPT].includes(type));
        return criticalThreats.length > 0 || ipInfo.count > 50;
    }
    getSuspiciousIPs() {
        return Array.from(this.suspiciousIPs.entries())
            .map(([ip, info]) => ({ ip, ...info }))
            .sort((a, b) => b.count - a.count);
    }
    generateThreatId() {
        return `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    calculateSeverity(type, metadata) {
        if ([
            ThreatType.SQL_INJECTION,
            ThreatType.DATA_BREACH_ATTEMPT,
            ThreatType.PRIVILEGE_ESCALATION,
        ].includes(type)) {
            return ThreatSeverity.CRITICAL;
        }
        if ([
            ThreatType.XSS_ATTEMPT,
            ThreatType.PATH_TRAVERSAL,
            ThreatType.MALICIOUS_FILE_UPLOAD,
            ThreatType.UNAUTHORIZED_ACCESS,
        ].includes(type)) {
            return ThreatSeverity.HIGH;
        }
        if ([
            ThreatType.BRUTE_FORCE,
            ThreatType.SUSPICIOUS_ACTIVITY,
        ].includes(type)) {
            return ThreatSeverity.MEDIUM;
        }
        return ThreatSeverity.LOW;
    }
    trackSuspiciousIP(ip, threatType) {
        const existing = this.suspiciousIPs.get(ip);
        if (existing) {
            existing.count++;
            existing.lastSeen = new Date();
            if (!existing.threats.includes(threatType)) {
                existing.threats.push(threatType);
            }
        }
        else {
            this.suspiciousIPs.set(ip, {
                count: 1,
                lastSeen: new Date(),
                threats: [threatType],
            });
        }
    }
    async checkAutomatedResponse(threat) {
        const threshold = this.alertThresholds[threat.type];
        const ipInfo = this.suspiciousIPs.get(threat.source);
        if (ipInfo && ipInfo.count >= threshold) {
            this.logger.error(`Automated response triggered for IP ${threat.source}: ${ipInfo.count} threats of type ${threat.type}`);
        }
        if (threat.severity === ThreatSeverity.CRITICAL) {
            this.logger.error(`CRITICAL SECURITY THREAT: ${threat.type} from ${threat.source}`);
        }
    }
    async logSecurityEvent(threat, action = 'THREAT_DETECTED') {
        try {
            await this.auditLogModel.create({
                userId: null,
                email: 'system',
                action,
                resource: 'security',
                resourceId: threat.id,
                changes: {
                    threatType: threat.type,
                    severity: threat.severity,
                    source: threat.source,
                    description: threat.description,
                    metadata: threat.metadata,
                },
                ipAddress: threat.source,
                userAgent: threat.metadata?.userAgent || 'unknown',
                success: true,
                timestamp: threat.timestamp,
            });
        }
        catch (error) {
            this.logger.error('Failed to log security event to audit system', error);
        }
    }
    getTimeframeStart(now, timeframe) {
        const start = new Date(now);
        switch (timeframe) {
            case 'hour':
                start.setHours(start.getHours() - 1);
                break;
            case 'day':
                start.setDate(start.getDate() - 1);
                break;
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
        }
        return start;
    }
    cleanupOldThreats() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        let cleaned = 0;
        for (const [id, threat] of this.threats.entries()) {
            if (threat.timestamp < cutoff && threat.resolved) {
                this.threats.delete(id);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            this.logger.log(`Cleaned up ${cleaned} old resolved threats`);
        }
        const ipCutoff = new Date();
        ipCutoff.setHours(ipCutoff.getHours() - 24);
        let cleanedIPs = 0;
        for (const [ip, info] of this.suspiciousIPs.entries()) {
            if (info.lastSeen < ipCutoff && info.count < 10) {
                this.suspiciousIPs.delete(ip);
                cleanedIPs++;
            }
        }
        if (cleanedIPs > 0) {
            this.logger.log(`Cleaned up ${cleanedIPs} old suspicious IP records`);
        }
    }
};
exports.SecurityMonitoringService = SecurityMonitoringService;
exports.SecurityMonitoringService = SecurityMonitoringService = SecurityMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService])
], SecurityMonitoringService);
//# sourceMappingURL=security-monitoring.service.js.map