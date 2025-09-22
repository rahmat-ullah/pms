import { Model } from 'mongoose';
import { AuditLogDocument, AuditAction, AuditEntityType } from '../database/schemas/audit-log.schema';
import { AuditQueryDto, AuditResponseDto, AuditStatsResponseDto } from './dto/audit.dto';
export interface CreateAuditLogData {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    changes?: Record<string, any>;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    metadata?: Record<string, any>;
}
export declare class AuditService {
    private auditLogModel;
    constructor(auditLogModel: Model<AuditLogDocument>);
    createAuditLog(data: CreateAuditLogData): Promise<AuditLogDocument>;
    findAll(query: AuditQueryDto): Promise<{
        auditLogs: AuditResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<AuditResponseDto | null>;
    findByEntityId(entityId: string, entityType?: AuditEntityType): Promise<AuditResponseDto[]>;
    findByUserId(userId: string, query: AuditQueryDto): Promise<{
        auditLogs: AuditResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAuditStats(startDate?: Date, endDate?: Date): Promise<AuditStatsResponseDto>;
    getComplianceReport(startDate: Date, endDate: Date): Promise<any>;
    cleanupOldLogs(retentionDays?: number): Promise<{
        deletedCount: number;
    }>;
    private buildSearchFilter;
    private maskSensitiveData;
    private mapToResponseDto;
}
