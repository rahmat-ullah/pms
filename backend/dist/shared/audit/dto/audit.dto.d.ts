import { AuditAction, AuditEntityType } from '../../database/schemas/audit-log.schema';
export declare class AuditQueryDto {
    page?: number;
    limit?: number;
    userId?: string;
    userEmail?: string;
    action?: AuditAction;
    entityType?: AuditEntityType;
    entityId?: string;
    ipAddress?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class AuditLogDto {
    id: string;
    userId: string;
    userEmail: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}
export declare class AuditStatsDto {
    totalLogs: number;
    actionCounts: Record<AuditAction, number>;
    entityCounts: Record<AuditEntityType, number>;
    uniqueUsers: number;
    oldestLog: Date;
    newestLog: Date;
    averageLogsPerDay: number;
}
export declare class AuditResponseDto {
    id: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
    changes?: Record<string, any>;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    metadata?: Record<string, any>;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        fullName: string;
    };
}
export declare class AuditStatsResponseDto {
    totalLogs: number;
    actionStats: Array<{
        action: AuditAction;
        count: number;
    }>;
    entityTypeStats: Array<{
        entityType: AuditEntityType;
        count: number;
    }>;
    topUsers: Array<{
        userId: string;
        userEmail: string;
        userName: string;
        count: number;
    }>;
    dailyActivity: Array<{
        date: string;
        count: number;
    }>;
}
export declare class AuditListResponseDto {
    data: AuditLogDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare class CreateAuditLogDto {
    userId: string;
    userEmail: string;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    metadata?: Record<string, any>;
}
export declare class AuditComplianceReportDto {
    startDate: Date;
    endDate: Date;
    totalActivities: number;
    uniqueUsers: number;
    actionBreakdown: Record<AuditAction, number>;
    entityBreakdown: Record<AuditEntityType, number>;
    topIpAddresses: string[];
    mostActiveUsers: string[];
    averageActivitiesPerDay: number;
    securityEvents: Record<string, number>;
}
