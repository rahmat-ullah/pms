import { AuditService } from './audit.service';
import { AuditQueryDto, AuditResponseDto, AuditStatsResponseDto } from './dto/audit.dto';
import { AuditEntityType } from '../database/schemas/audit-log.schema';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(query: AuditQueryDto): Promise<{
        auditLogs: AuditResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAuditStats(startDate?: string, endDate?: string): Promise<AuditStatsResponseDto>;
    getComplianceReport(startDate: string, endDate: string): Promise<any>;
    findByEntityId(entityId: string, entityType?: AuditEntityType): Promise<AuditResponseDto[]>;
    findByUserId(userId: string, query: AuditQueryDto): Promise<{
        auditLogs: AuditResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getMyActivity(currentUser: any, query: AuditQueryDto): Promise<{
        auditLogs: AuditResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<AuditResponseDto | null>;
    cleanupOldLogs(retentionDays?: number): Promise<{
        message: string;
        deletedCount: number;
    }>;
    exportToCsv(query: AuditQueryDto): Promise<{
        content: string;
        filename: string;
        contentType: string;
    }>;
    getDashboardSummary(): Promise<{
        weekly: AuditStatsResponseDto;
        monthly: AuditStatsResponseDto;
        summary: {
            weeklyTotal: number;
            monthlyTotal: number;
            weeklyGrowth: number;
            monthlyGrowth: number;
        };
    }>;
}
