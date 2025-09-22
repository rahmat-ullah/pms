import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { AuditLogDocument } from '../database/schemas/audit-log.schema';
export interface SecurityThreat {
    id: string;
    type: ThreatType;
    severity: ThreatSeverity;
    source: string;
    description: string;
    timestamp: Date;
    metadata: any;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
}
export declare enum ThreatType {
    BRUTE_FORCE = "brute_force",
    SQL_INJECTION = "sql_injection",
    XSS_ATTEMPT = "xss_attempt",
    PATH_TRAVERSAL = "path_traversal",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
    UNAUTHORIZED_ACCESS = "unauthorized_access",
    DATA_BREACH_ATTEMPT = "data_breach_attempt",
    MALICIOUS_FILE_UPLOAD = "malicious_file_upload",
    PRIVILEGE_ESCALATION = "privilege_escalation"
}
export declare enum ThreatSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface SecurityMetrics {
    totalThreats: number;
    threatsToday: number;
    threatsByType: Record<ThreatType, number>;
    threatsBySeverity: Record<ThreatSeverity, number>;
    topSources: Array<{
        source: string;
        count: number;
    }>;
    resolvedThreats: number;
    averageResolutionTime: number;
}
export declare class SecurityMonitoringService {
    private auditLogModel;
    private configService;
    private readonly logger;
    private readonly threats;
    private readonly suspiciousIPs;
    private readonly alertThresholds;
    constructor(auditLogModel: Model<AuditLogDocument>, configService: ConfigService);
    reportThreat(type: ThreatType, source: string, description: string, metadata?: any, severity?: ThreatSeverity): Promise<SecurityThreat>;
    getSecurityMetrics(timeframe?: 'hour' | 'day' | 'week' | 'month'): Promise<SecurityMetrics>;
    getActiveThreats(severity?: ThreatSeverity): SecurityThreat[];
    resolveThreat(threatId: string, resolvedBy: string): Promise<boolean>;
    shouldBlockIP(ip: string): boolean;
    getSuspiciousIPs(): Array<{
        ip: string;
        count: number;
        lastSeen: Date;
        threats: ThreatType[];
    }>;
    private generateThreatId;
    private calculateSeverity;
    private trackSuspiciousIP;
    private checkAutomatedResponse;
    private logSecurityEvent;
    private getTimeframeStart;
    private cleanupOldThreats;
}
