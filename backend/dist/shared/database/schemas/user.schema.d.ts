import { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    HR_MANAGER = "hr_manager",
    PROJECT_MANAGER = "project_manager",
    TEAM_LEAD = "team_lead",
    EMPLOYEE = "employee",
    CONTRACTOR = "contractor",
    VIEWER = "viewer",
    AUDITOR = "auditor"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING = "pending",
    ARCHIVED = "archived"
}
export interface UserPermissions {
    canManageUsers: boolean;
    canManageEmployees: boolean;
    canManageProjects: boolean;
    canViewReports: boolean;
    canManageAttendance: boolean;
    canApproveLeave: boolean;
    canManagePayroll: boolean;
    canAccessFinance: boolean;
    canManageSettings: boolean;
}
export declare class User {
    _id: Types.ObjectId;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    permissions: UserPermissions;
    employeeProfile?: Types.ObjectId;
    profileImage?: string;
    phoneNumber?: string;
    lastLoginAt?: Date;
    emailVerifiedAt?: Date;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    refreshTokens: string[];
    preferences: Record<string, any>;
    metadata: Record<string, any>;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    archivedAt?: Date;
    archivedBy?: Types.ObjectId;
    get fullName(): string;
    get isActive(): boolean;
    get isEmailVerified(): boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
