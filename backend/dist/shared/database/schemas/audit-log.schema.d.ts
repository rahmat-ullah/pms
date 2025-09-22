import { Document, Types } from 'mongoose';
export type AuditLogDocument = AuditLog & Document;
export declare enum AuditAction {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
    LOGIN = "login",
    LOGOUT = "logout",
    EXPORT = "export",
    IMPORT = "import",
    APPROVE = "approve",
    REJECT = "reject",
    ARCHIVE = "archive",
    RESTORE = "restore"
}
export declare enum AuditEntityType {
    USER = "user",
    EMPLOYEE = "employee",
    PROJECT = "project",
    SKILL = "skill",
    DEPARTMENT = "department",
    ROLE = "role",
    LOCATION = "location",
    ATTENDANCE = "attendance",
    LEAVE = "leave",
    PAYROLL = "payroll",
    FILE = "file",
    AUTH = "auth",
    SYSTEM = "system"
}
export interface AuditContext {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
}
export interface AuditChanges {
    field: string;
    oldValue: any;
    newValue: any;
    dataType: string;
}
export declare class AuditLog {
    _id: Types.ObjectId;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    userId?: Types.ObjectId;
    userEmail: string;
    description: string;
    changes: AuditChanges[];
    previousData?: Record<string, any>;
    newData?: Record<string, any>;
    context: AuditContext;
    metadata: Record<string, any>;
    severity: string;
    tags: string[];
    isSystemGenerated: boolean;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AuditLogSchema: import("mongoose").Schema<AuditLog, import("mongoose").Model<AuditLog, any, any, any, Document<unknown, any, AuditLog, any, {}> & AuditLog & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuditLog, Document<unknown, {}, import("mongoose").FlatRecord<AuditLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AuditLog> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
