import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { AuditLogDocument } from '../database/schemas/audit-log.schema';
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
export declare enum ComplianceReportType {
    GDPR = "gdpr",
    SOX = "sox",
    HIPAA = "hipaa",
    PCI_DSS = "pci_dss",
    ISO_27001 = "iso_27001",
    CUSTOM = "custom"
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
export declare class ComplianceService {
    private auditLogModel;
    private configService;
    private readonly logger;
    constructor(auditLogModel: Model<AuditLogDocument>, configService: ConfigService);
    generateComplianceReport(type: ComplianceReportType, startDate: Date, endDate: Date, generatedBy: string): Promise<ComplianceReport>;
    verifyAuditLogIntegrity(logId?: string): Promise<TamperEvidence[]>;
    getGDPRUserData(userId: string): Promise<any>;
    generateDataRetentionReport(): Promise<any>;
    getAuthenticationComplianceMetrics(days?: number): Promise<any>;
    private generateComplianceSummary;
    private generateTypeSpecificDetails;
    private generateGDPRDetails;
    private generateSOXDetails;
    private generateHIPAADetails;
    private generatePCIDSSDetails;
    private generateISO27001Details;
    private calculateLogHash;
    private calculateReportHash;
    private generateReportId;
}
