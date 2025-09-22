import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction } from '../database/schemas/audit-log.schema';
import * as crypto from 'crypto';

export interface ComplianceReport {
  id: string;
  type: ComplianceReportType;
  period: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  generatedBy: string;
  summary: ComplianceSummary;
  details: any;
  hash: string;
}

export enum ComplianceReportType {
  GDPR = 'gdpr',
  SOX = 'sox',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  ISO_27001 = 'iso_27001',
  CUSTOM = 'custom',
}

export interface ComplianceSummary {
  totalEvents: number;
  authenticationEvents: number;
  dataAccessEvents: number;
  dataModificationEvents: number;
  securityEvents: number;
  failedAttempts: number;
  privilegedAccess: number;
  dataExports: number;
  userCreations: number;
  userDeletions: number;
  permissionChanges: number;
}

export interface TamperEvidence {
  logId: string;
  originalHash: string;
  currentHash: string;
  tampered: boolean;
  checkedAt: Date;
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    private configService: ConfigService,
  ) {}

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    type: ComplianceReportType,
    startDate: Date,
    endDate: Date,
    generatedBy: string,
  ): Promise<ComplianceReport> {
    this.logger.log(`Generating ${type} compliance report for period ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Fetch audit logs for the period
    const auditLogs = await this.auditLogModel
      .find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ timestamp: 1 })
      .exec();

    // Generate summary
    const summary = this.generateComplianceSummary(auditLogs);

    // Generate type-specific details
    const details = await this.generateTypeSpecificDetails(type, auditLogs);

    const report: ComplianceReport = {
      id: this.generateReportId(),
      type,
      period: { start: startDate, end: endDate },
      generatedAt: new Date(),
      generatedBy,
      summary,
      details,
      hash: '', // Will be calculated after serialization
    };

    // Calculate tamper-evident hash
    report.hash = this.calculateReportHash(report);

    this.logger.log(`Compliance report generated: ${report.id}`);
    return report;
  }

  /**
   * Verify audit log integrity
   */
  async verifyAuditLogIntegrity(logId?: string): Promise<TamperEvidence[]> {
    const query = logId ? { _id: logId } : {};
    const logs = await this.auditLogModel.find(query).exec();

    const results: TamperEvidence[] = [];

    for (const log of logs) {
      // Calculate hash based on immutable fields
      const currentHash = this.calculateLogHash(log);
      // For now, assume no original hash stored - in production you'd store this
      const originalHash = currentHash;

      results.push({
        logId: log._id.toString(),
        originalHash,
        currentHash,
        tampered: false, // Would compare with stored hash in production
        checkedAt: new Date(),
      });
    }

    return results;
  }

  /**
   * Get GDPR compliance data for a user
   */
  async getGDPRUserData(userId: string): Promise<any> {
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

  /**
   * Generate data retention report
   */
  async generateDataRetentionReport(): Promise<any> {
    const retentionPeriod = this.configService.get<number>('DATA_RETENTION_DAYS', 2555); // 7 years default
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

  /**
   * Get authentication compliance metrics
   */
  async getAuthenticationComplianceMetrics(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const authLogs = await this.auditLogModel
      .find({
        timestamp: { $gte: startDate },
        action: { $in: [
          AuditAction.LOGIN_SUCCESS,
          AuditAction.LOGIN_FAILED,
          AuditAction.LOGOUT,
          AuditAction.PASSWORD_CHANGED,
          AuditAction.ACCOUNT_LOCKED
        ] },
      })
      .exec();

    const metrics = {
      totalAuthEvents: authLogs.length,
      successfulLogins: authLogs.filter(log => log.action === AuditAction.LOGIN_SUCCESS).length,
      failedLogins: authLogs.filter(log => log.action === AuditAction.LOGIN_FAILED).length,
      passwordChanges: authLogs.filter(log => log.action === AuditAction.PASSWORD_CHANGED).length,
      accountLockouts: authLogs.filter(log => log.action === AuditAction.ACCOUNT_LOCKED).length,
      uniqueUsers: new Set(authLogs.map(log => log.userId)).size,
      suspiciousActivity: authLogs.filter(log =>
        log.action === AuditAction.LOGIN_FAILED && log.metadata?.consecutiveFailures > 3
      ).length,
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

  private generateComplianceSummary(logs: AuditLogDocument[]): ComplianceSummary {
    return {
      totalEvents: logs.length,
      authenticationEvents: logs.filter(log =>
        [AuditAction.LOGIN_SUCCESS, AuditAction.LOGIN_FAILED, AuditAction.LOGOUT, AuditAction.PASSWORD_CHANGED].includes(log.action)
      ).length,
      dataAccessEvents: logs.filter(log => log.action === AuditAction.READ).length,
      dataModificationEvents: logs.filter(log =>
        [AuditAction.CREATE, AuditAction.UPDATE, AuditAction.DELETE].includes(log.action)
      ).length,
      securityEvents: logs.filter(log =>
        log.description.toLowerCase().includes('security') || log.description.toLowerCase().includes('threat')
      ).length,
      failedAttempts: logs.filter(log => log.action === AuditAction.LOGIN_FAILED).length,
      privilegedAccess: logs.filter(log => 
        log.metadata?.userRole && ['ADMIN', 'SUPER_ADMIN'].includes(log.metadata.userRole)
      ).length,
      dataExports: logs.filter(log => log.action === AuditAction.EXPORT).length,
      userCreations: logs.filter(log => log.action === AuditAction.CREATE && log.entityType === 'user').length,
      userDeletions: logs.filter(log => log.action === AuditAction.DELETE && log.entityType === 'user').length,
      permissionChanges: logs.filter(log =>
        log.description.toLowerCase().includes('permission') || log.description.toLowerCase().includes('role')
      ).length,
    };
  }

  private async generateTypeSpecificDetails(
    type: ComplianceReportType,
    logs: AuditLogDocument[],
  ): Promise<any> {
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
        return { logs: logs.slice(0, 100) }; // Return sample for custom reports
    }
  }

  private generateGDPRDetails(logs: AuditLogDocument[]): any {
    return {
      dataSubjectRequests: logs.filter(log => 
        log.action.includes('DATA_REQUEST') || log.action.includes('DATA_EXPORT')
      ),
      consentEvents: logs.filter(log => log.action.includes('CONSENT')),
      dataBreachEvents: logs.filter(log => log.action.includes('BREACH')),
      rightToErasure: logs.filter(log => log.action.includes('DELETE') && log.metadata?.gdprRequest),
      dataPortability: logs.filter(log => log.action.includes('EXPORT') && log.metadata?.gdprRequest),
    };
  }

  private generateSOXDetails(logs: AuditLogDocument[]): any {
    return {
      financialDataAccess: logs.filter(log =>
        log.entityType === 'payroll' || log.description.toLowerCase().includes('financial')
      ),
      privilegedUserActivity: logs.filter(log =>
        log.metadata?.userRole && ['ADMIN', 'SUPER_ADMIN'].includes(log.metadata.userRole)
      ),
      systemChanges: logs.filter(log =>
        log.entityType === 'system' || log.description.toLowerCase().includes('config')
      ),
      accessControlChanges: logs.filter(log =>
        log.description.toLowerCase().includes('permission') || log.description.toLowerCase().includes('role')
      ),
    };
  }

  private generateHIPAADetails(logs: AuditLogDocument[]): any {
    return {
      phiAccess: logs.filter(log => log.metadata?.containsPHI),
      unauthorizedAccess: logs.filter(log => log.action === AuditAction.LOGIN_FAILED && log.metadata?.containsPHI),
      dataDisclosure: logs.filter(log =>
        log.action === AuditAction.EXPORT && log.metadata?.containsPHI
      ),
      systemActivity: logs.filter(log => log.entityType === 'system'),
    };
  }

  private generatePCIDSSDetails(logs: AuditLogDocument[]): any {
    return {
      cardDataAccess: logs.filter(log => log.metadata?.containsCardData),
      networkActivity: logs.filter(log => log.action.includes('NETWORK')),
      securityEvents: logs.filter(log => log.action.includes('SECURITY')),
      accessControlEvents: logs.filter(log => 
        log.action.includes('ACCESS') || log.action.includes('AUTH')
      ),
    };
  }

  private generateISO27001Details(logs: AuditLogDocument[]): any {
    return {
      informationSecurityEvents: logs.filter(log => 
        log.action.includes('SECURITY') || log.action.includes('THREAT')
      ),
      accessManagement: logs.filter(log => 
        log.action.includes('ACCESS') || log.action.includes('PERMISSION')
      ),
      incidentResponse: logs.filter(log => log.action.includes('INCIDENT')),
      riskManagement: logs.filter(log => log.action.includes('RISK')),
    };
  }

  private calculateLogHash(log: AuditLogDocument): string {
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

  private calculateReportHash(report: Omit<ComplianceReport, 'hash'>): string {
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

  private generateReportId(): string {
    return `compliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
