import { SecurityMonitoringService, ThreatSeverity, ThreatType } from './security-monitoring.service';
import { UserDocument } from '../database/schemas/user.schema';
export declare class SecurityMonitoringController {
    private readonly securityService;
    constructor(securityService: SecurityMonitoringService);
    getSecurityMetrics(timeframe?: 'hour' | 'day' | 'week' | 'month'): Promise<{
        success: boolean;
        data: import("./security-monitoring.service").SecurityMetrics;
        timeframe: "hour" | "day" | "week" | "month";
        timestamp: Date;
    }>;
    getActiveThreats(severity?: ThreatSeverity, limit?: number): Promise<{
        success: boolean;
        data: import("./security-monitoring.service").SecurityThreat[];
        total: number;
        filtered: number;
        severity: ThreatSeverity;
    }>;
    getSuspiciousIPs(limit?: number): Promise<{
        success: boolean;
        data: {
            ip: string;
            count: number;
            lastSeen: Date;
            threats: ThreatType[];
        }[];
        total: number;
        filtered: number;
    }>;
    resolveThreat(threatId: string, user: UserDocument): Promise<{
        success: boolean;
        message: string;
        threatId?: undefined;
        resolvedBy?: undefined;
        resolvedAt?: undefined;
    } | {
        success: boolean;
        message: string;
        threatId: string;
        resolvedBy: string;
        resolvedAt: Date;
    }>;
    reportThreat(body: {
        type: ThreatType;
        source: string;
        description: string;
        severity?: ThreatSeverity;
        metadata?: any;
    }, user: UserDocument): Promise<{
        success: boolean;
        message: string;
        data: import("./security-monitoring.service").SecurityThreat;
    }>;
    getSecurityDashboard(): Promise<{
        success: boolean;
        data: {
            overview: {
                totalThreats: number;
                threatsToday: number;
                activeThreats: number;
                resolvedThreats: number;
                averageResolutionTime: number;
            };
            threatsByType: Record<ThreatType, number>;
            threatsBySeverity: Record<ThreatSeverity, number>;
            recentHighThreats: import("./security-monitoring.service").SecurityThreat[];
            topSources: {
                ip: string;
                count: number;
                lastSeen: Date;
                threats: ThreatType[];
            }[];
            threatTrends: {
                increasing: boolean;
                stable: boolean;
                decreasing: boolean;
            };
            lastUpdated: Date;
        };
    }>;
    getSecurityHealth(): Promise<{
        success: boolean;
        data: {
            status: "critical" | "warning" | "healthy";
            healthScore: number;
            criticalThreats: number;
            totalActiveThreats: number;
            threatsToday: number;
            systemUptime: number;
            lastCheck: Date;
            recommendations: string[];
        };
    }>;
    private getHealthRecommendations;
}
