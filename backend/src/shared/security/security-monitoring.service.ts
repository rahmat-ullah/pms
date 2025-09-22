import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../database/schemas/audit-log.schema';

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

export enum ThreatType {
  BRUTE_FORCE = 'brute_force',
  SQL_INJECTION = 'sql_injection',
  XSS_ATTEMPT = 'xss_attempt',
  PATH_TRAVERSAL = 'path_traversal',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  MALICIOUS_FILE_UPLOAD = 'malicious_file_upload',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
}

export enum ThreatSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SecurityMetrics {
  totalThreats: number;
  threatsToday: number;
  threatsByType: Record<ThreatType, number>;
  threatsBySeverity: Record<ThreatSeverity, number>;
  topSources: Array<{ source: string; count: number }>;
  resolvedThreats: number;
  averageResolutionTime: number;
}

@Injectable()
export class SecurityMonitoringService {
  private readonly logger = new Logger(SecurityMonitoringService.name);
  private readonly threats = new Map<string, SecurityThreat>();
  private readonly suspiciousIPs = new Map<string, { count: number; lastSeen: Date; threats: ThreatType[] }>();
  private readonly alertThresholds = {
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

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    private configService: ConfigService,
  ) {
    // Clean up old threats every hour
    setInterval(() => {
      this.cleanupOldThreats();
    }, 60 * 60 * 1000);
  }

  /**
   * Report a security threat
   */
  async reportThreat(
    type: ThreatType,
    source: string,
    description: string,
    metadata: any = {},
    severity?: ThreatSeverity,
  ): Promise<SecurityThreat> {
    const threatId = this.generateThreatId();
    const calculatedSeverity = severity || this.calculateSeverity(type, metadata);
    
    const threat: SecurityThreat = {
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

    // Log the threat
    this.logger.warn(`Security threat detected: ${type} from ${source} - ${description}`, {
      threatId,
      severity: calculatedSeverity,
      metadata,
    });

    // Check if automated response is needed
    await this.checkAutomatedResponse(threat);

    // Log to audit system
    await this.logSecurityEvent(threat);

    return threat;
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<SecurityMetrics> {
    const now = new Date();
    const startTime = this.getTimeframeStart(now, timeframe);
    
    const recentThreats = Array.from(this.threats.values())
      .filter(threat => threat.timestamp >= startTime);

    const threatsByType = {} as Record<ThreatType, number>;
    const threatsBySeverity = {} as Record<ThreatSeverity, number>;
    const sourceCounts = new Map<string, number>();

    // Initialize counters
    Object.values(ThreatType).forEach(type => threatsByType[type] = 0);
    Object.values(ThreatSeverity).forEach(severity => threatsBySeverity[severity] = 0);

    // Count threats
    recentThreats.forEach(threat => {
      threatsByType[threat.type]++;
      threatsBySeverity[threat.severity]++;
      
      const count = sourceCounts.get(threat.source) || 0;
      sourceCounts.set(threat.source, count + 1);
    });

    // Get top sources
    const topSources = Array.from(sourceCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));

    // Calculate resolution metrics
    const resolvedThreats = recentThreats.filter(t => t.resolved).length;
    const resolutionTimes = recentThreats
      .filter(t => t.resolved && t.resolvedAt)
      .map(t => t.resolvedAt!.getTime() - t.timestamp.getTime());
    
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
      averageResolutionTime: Math.round(averageResolutionTime / 1000), // Convert to seconds
    };
  }

  /**
   * Get active threats
   */
  getActiveThreats(severity?: ThreatSeverity): SecurityThreat[] {
    return Array.from(this.threats.values())
      .filter(threat => !threat.resolved)
      .filter(threat => !severity || threat.severity === severity)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Resolve a threat
   */
  async resolveThreat(threatId: string, resolvedBy: string): Promise<boolean> {
    const threat = this.threats.get(threatId);
    if (!threat) {
      return false;
    }

    threat.resolved = true;
    threat.resolvedAt = new Date();
    threat.resolvedBy = resolvedBy;

    this.threats.set(threatId, threat);

    this.logger.log(`Security threat resolved: ${threatId} by ${resolvedBy}`);
    
    // Log resolution to audit system
    await this.logSecurityEvent(threat, 'THREAT_RESOLVED');

    return true;
  }

  /**
   * Check if IP should be blocked
   */
  shouldBlockIP(ip: string): boolean {
    const ipInfo = this.suspiciousIPs.get(ip);
    if (!ipInfo) return false;

    // Block if too many threats from this IP
    const criticalThreats = ipInfo.threats.filter(type => 
      [ThreatType.SQL_INJECTION, ThreatType.XSS_ATTEMPT, ThreatType.DATA_BREACH_ATTEMPT].includes(type)
    );

    return criticalThreats.length > 0 || ipInfo.count > 50;
  }

  /**
   * Get suspicious IPs
   */
  getSuspiciousIPs(): Array<{ ip: string; count: number; lastSeen: Date; threats: ThreatType[] }> {
    return Array.from(this.suspiciousIPs.entries())
      .map(([ip, info]) => ({ ip, ...info }))
      .sort((a, b) => b.count - a.count);
  }

  private generateThreatId(): string {
    return `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSeverity(type: ThreatType, metadata: any): ThreatSeverity {
    // Critical threats
    if ([
      ThreatType.SQL_INJECTION,
      ThreatType.DATA_BREACH_ATTEMPT,
      ThreatType.PRIVILEGE_ESCALATION,
    ].includes(type)) {
      return ThreatSeverity.CRITICAL;
    }

    // High severity threats
    if ([
      ThreatType.XSS_ATTEMPT,
      ThreatType.PATH_TRAVERSAL,
      ThreatType.MALICIOUS_FILE_UPLOAD,
      ThreatType.UNAUTHORIZED_ACCESS,
    ].includes(type)) {
      return ThreatSeverity.HIGH;
    }

    // Medium severity threats
    if ([
      ThreatType.BRUTE_FORCE,
      ThreatType.SUSPICIOUS_ACTIVITY,
    ].includes(type)) {
      return ThreatSeverity.MEDIUM;
    }

    // Default to low
    return ThreatSeverity.LOW;
  }

  private trackSuspiciousIP(ip: string, threatType: ThreatType): void {
    const existing = this.suspiciousIPs.get(ip);
    if (existing) {
      existing.count++;
      existing.lastSeen = new Date();
      if (!existing.threats.includes(threatType)) {
        existing.threats.push(threatType);
      }
    } else {
      this.suspiciousIPs.set(ip, {
        count: 1,
        lastSeen: new Date(),
        threats: [threatType],
      });
    }
  }

  private async checkAutomatedResponse(threat: SecurityThreat): Promise<void> {
    const threshold = this.alertThresholds[threat.type];
    const ipInfo = this.suspiciousIPs.get(threat.source);
    
    if (ipInfo && ipInfo.count >= threshold) {
      this.logger.error(`Automated response triggered for IP ${threat.source}: ${ipInfo.count} threats of type ${threat.type}`);
      
      // In a real implementation, you might:
      // - Add IP to firewall block list
      // - Send alerts to security team
      // - Trigger incident response workflow
      // - Temporarily disable user accounts
    }

    // Critical threats get immediate attention
    if (threat.severity === ThreatSeverity.CRITICAL) {
      this.logger.error(`CRITICAL SECURITY THREAT: ${threat.type} from ${threat.source}`);
      // Trigger immediate alerts
    }
  }

  private async logSecurityEvent(threat: SecurityThreat, action: string = 'THREAT_DETECTED'): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to log security event to audit system', error);
    }
  }

  private getTimeframeStart(now: Date, timeframe: string): Date {
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

  private cleanupOldThreats(): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30); // Keep threats for 30 days

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

    // Clean up old suspicious IPs
    const ipCutoff = new Date();
    ipCutoff.setHours(ipCutoff.getHours() - 24); // Keep IP info for 24 hours

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
}
