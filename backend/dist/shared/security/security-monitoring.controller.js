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
exports.SecurityMonitoringController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const security_monitoring_service_1 = require("./security-monitoring.service");
const jwt_auth_guard_1 = require("../../modules/auth/guards/jwt-auth.guard");
const permissions_decorator_1 = require("../../modules/auth/decorators/permissions.decorator");
const permissions_service_1 = require("../../modules/auth/services/permissions.service");
const current_user_decorator_1 = require("../../modules/auth/decorators/current-user.decorator");
let SecurityMonitoringController = class SecurityMonitoringController {
    constructor(securityService) {
        this.securityService = securityService;
    }
    async getSecurityMetrics(timeframe = 'day') {
        const metrics = await this.securityService.getSecurityMetrics(timeframe);
        return {
            success: true,
            data: metrics,
            timeframe,
            timestamp: new Date(),
        };
    }
    async getActiveThreats(severity, limit = 50) {
        const threats = this.securityService.getActiveThreats(severity);
        const limitedThreats = threats.slice(0, limit);
        return {
            success: true,
            data: limitedThreats,
            total: threats.length,
            filtered: limitedThreats.length,
            severity,
        };
    }
    async getSuspiciousIPs(limit = 20) {
        const suspiciousIPs = this.securityService.getSuspiciousIPs();
        const limitedIPs = suspiciousIPs.slice(0, limit);
        return {
            success: true,
            data: limitedIPs,
            total: suspiciousIPs.length,
            filtered: limitedIPs.length,
        };
    }
    async resolveThreat(threatId, user) {
        const resolved = await this.securityService.resolveThreat(threatId, `${user.firstName} ${user.lastName} (${user.email})`);
        if (!resolved) {
            return {
                success: false,
                message: 'Threat not found or already resolved',
            };
        }
        return {
            success: true,
            message: 'Threat resolved successfully',
            threatId,
            resolvedBy: user.email,
            resolvedAt: new Date(),
        };
    }
    async reportThreat(body, user) {
        const threat = await this.securityService.reportThreat(body.type, body.source, body.description, {
            ...body.metadata,
            reportedBy: user.email,
            reportedAt: new Date(),
        }, body.severity);
        return {
            success: true,
            message: 'Threat reported successfully',
            data: threat,
        };
    }
    async getSecurityDashboard() {
        const [metrics, activeThreats, suspiciousIPs] = await Promise.all([
            this.securityService.getSecurityMetrics('day'),
            this.securityService.getActiveThreats(),
            this.securityService.getSuspiciousIPs(),
        ]);
        const recentHighThreats = activeThreats
            .filter(t => [security_monitoring_service_1.ThreatSeverity.HIGH, security_monitoring_service_1.ThreatSeverity.CRITICAL].includes(t.severity))
            .slice(0, 10);
        const topSources = suspiciousIPs.slice(0, 5);
        const threatTrends = {
            increasing: metrics.threatsToday > 10,
            stable: metrics.threatsToday >= 5 && metrics.threatsToday <= 10,
            decreasing: metrics.threatsToday < 5,
        };
        return {
            success: true,
            data: {
                overview: {
                    totalThreats: metrics.totalThreats,
                    threatsToday: metrics.threatsToday,
                    activeThreats: activeThreats.length,
                    resolvedThreats: metrics.resolvedThreats,
                    averageResolutionTime: metrics.averageResolutionTime,
                },
                threatsByType: metrics.threatsByType,
                threatsBySeverity: metrics.threatsBySeverity,
                recentHighThreats,
                topSources,
                threatTrends,
                lastUpdated: new Date(),
            },
        };
    }
    async getSecurityHealth() {
        const metrics = await this.securityService.getSecurityMetrics('hour');
        const activeThreats = this.securityService.getActiveThreats();
        let healthScore = 100;
        const criticalThreats = activeThreats.filter(t => t.severity === security_monitoring_service_1.ThreatSeverity.CRITICAL);
        healthScore -= criticalThreats.length * 20;
        if (metrics.threatsToday > 50)
            healthScore -= 15;
        else if (metrics.threatsToday > 20)
            healthScore -= 10;
        else if (metrics.threatsToday > 10)
            healthScore -= 5;
        const unresolvedThreats = activeThreats.length;
        if (unresolvedThreats > 20)
            healthScore -= 10;
        else if (unresolvedThreats > 10)
            healthScore -= 5;
        healthScore = Math.max(0, healthScore);
        let status;
        if (healthScore >= 80)
            status = 'healthy';
        else if (healthScore >= 60)
            status = 'warning';
        else
            status = 'critical';
        return {
            success: true,
            data: {
                status,
                healthScore,
                criticalThreats: criticalThreats.length,
                totalActiveThreats: activeThreats.length,
                threatsToday: metrics.threatsToday,
                systemUptime: process.uptime(),
                lastCheck: new Date(),
                recommendations: this.getHealthRecommendations(status, criticalThreats.length, unresolvedThreats),
            },
        };
    }
    getHealthRecommendations(status, criticalThreats, unresolvedThreats) {
        const recommendations = [];
        if (status === 'critical') {
            recommendations.push('Immediate attention required - critical security threats detected');
        }
        if (criticalThreats > 0) {
            recommendations.push(`Resolve ${criticalThreats} critical threat(s) immediately`);
        }
        if (unresolvedThreats > 10) {
            recommendations.push('High number of unresolved threats - consider increasing security team capacity');
        }
        if (status === 'warning') {
            recommendations.push('Monitor security metrics closely and prepare incident response');
        }
        if (recommendations.length === 0) {
            recommendations.push('Security system operating normally');
        }
        return recommendations;
    }
};
exports.SecurityMonitoringController = SecurityMonitoringController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, permissions_decorator_1.RequirePermission)(permissions_service_1.Permission.SYSTEM_AUDIT),
    (0, swagger_1.ApiOperation)({ summary: 'Get security metrics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Security metrics retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityMonitoringController.prototype, "getSecurityMetrics", null);
__decorate([
    (0, common_1.Get)('threats'),
    (0, permissions_decorator_1.RequirePermission)(permissions_service_1.Permission.SYSTEM_AUDIT),
    (0, swagger_1.ApiOperation)({ summary: 'Get active security threats' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Active threats retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('severity')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SecurityMonitoringController.prototype, "getActiveThreats", null);
__decorate([
    (0, common_1.Get)('suspicious-ips'),
    (0, permissions_decorator_1.RequirePermission)(permissions_service_1.Permission.SYSTEM_AUDIT),
    (0, swagger_1.ApiOperation)({ summary: 'Get suspicious IP addresses' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Suspicious IPs retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SecurityMonitoringController.prototype, "getSuspiciousIPs", null);
__decorate([
    (0, common_1.Post)('threats/:threatId/resolve'),
    (0, permissions_decorator_1.RequirePermission)(permissions_service_1.Permission.SYSTEM_AUDIT),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve a security threat' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Threat resolved successfully',
    }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('threatId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SecurityMonitoringController.prototype, "resolveThreat", null);
__decorate([
    (0, common_1.Post)('threats/report'),
    (0, permissions_decorator_1.RequirePermission)(permissions_service_1.Permission.SYSTEM_AUDIT),
    (0, swagger_1.ApiOperation)({ summary: 'Report a security threat manually' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Threat reported successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityMonitoringController.prototype, "reportThreat", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, permissions_decorator_1.RequirePermission)(permissions_service_1.Permission.SYSTEM_AUDIT),
    (0, swagger_1.ApiOperation)({ summary: 'Get security dashboard data' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Security dashboard data retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityMonitoringController.prototype, "getSecurityDashboard", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, permissions_decorator_1.RequirePermission)(permissions_service_1.Permission.SYSTEM_AUDIT),
    (0, swagger_1.ApiOperation)({ summary: 'Get security system health' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Security system health retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityMonitoringController.prototype, "getSecurityHealth", null);
exports.SecurityMonitoringController = SecurityMonitoringController = __decorate([
    (0, swagger_1.ApiTags)('Security Monitoring'),
    (0, common_1.Controller)('security'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [security_monitoring_service_1.SecurityMonitoringService])
], SecurityMonitoringController);
//# sourceMappingURL=security-monitoring.controller.js.map