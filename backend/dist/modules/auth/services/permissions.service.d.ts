import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../../shared/database/schemas/user.schema';
export declare enum Permission {
    USER_CREATE = "user.create",
    USER_READ = "user.read",
    USER_UPDATE = "user.update",
    USER_DELETE = "user.delete",
    USER_LIST = "user.list",
    USER_ASSIGN_ROLES = "user.assign_roles",
    USER_MANAGE_PERMISSIONS = "user.manage_permissions",
    EMPLOYEE_CREATE = "employee.create",
    EMPLOYEE_READ = "employee.read",
    EMPLOYEE_UPDATE = "employee.update",
    EMPLOYEE_DELETE = "employee.delete",
    EMPLOYEE_LIST = "employee.list",
    EMPLOYEE_MANAGE_PROFILE = "employee.manage_profile",
    EMPLOYEE_VIEW_SALARY = "employee.view_salary",
    EMPLOYEE_MANAGE_SKILLS = "employee.manage_skills",
    PROJECT_CREATE = "project.create",
    PROJECT_READ = "project.read",
    PROJECT_UPDATE = "project.update",
    PROJECT_DELETE = "project.delete",
    PROJECT_LIST = "project.list",
    PROJECT_ASSIGN_MEMBERS = "project.assign_members",
    PROJECT_MANAGE_BUDGET = "project.manage_budget",
    PROJECT_VIEW_REPORTS = "project.view_reports",
    ATTENDANCE_CREATE = "attendance.create",
    ATTENDANCE_READ = "attendance.read",
    ATTENDANCE_UPDATE = "attendance.update",
    ATTENDANCE_DELETE = "attendance.delete",
    ATTENDANCE_APPROVE = "attendance.approve",
    ATTENDANCE_VIEW_REPORTS = "attendance.view_reports",
    LEAVE_CREATE = "leave.create",
    LEAVE_READ = "leave.read",
    LEAVE_UPDATE = "leave.update",
    LEAVE_DELETE = "leave.delete",
    LEAVE_APPROVE = "leave.approve",
    LEAVE_REJECT = "leave.reject",
    LEAVE_VIEW_REPORTS = "leave.view_reports",
    FINANCE_READ = "finance.read",
    FINANCE_MANAGE = "finance.manage",
    PAYROLL_READ = "payroll.read",
    PAYROLL_MANAGE = "payroll.manage",
    BUDGET_READ = "budget.read",
    BUDGET_MANAGE = "budget.manage",
    REPORTS_VIEW = "reports.view",
    REPORTS_CREATE = "reports.create",
    REPORTS_EXPORT = "reports.export",
    ANALYTICS_VIEW = "analytics.view",
    SYSTEM_SETTINGS = "system.settings",
    SYSTEM_BACKUP = "system.backup",
    SYSTEM_LOGS = "system.logs",
    SYSTEM_AUDIT = "system.audit",
    FILE_UPLOAD = "file.upload",
    FILE_DOWNLOAD = "file.download",
    FILE_DELETE = "file.delete",
    FILE_MANAGE = "file.manage"
}
export interface RolePermissions {
    role: UserRole;
    permissions: Permission[];
    inheritsFrom?: UserRole[];
}
export declare class PermissionsService {
    private configService;
    private readonly logger;
    private readonly permissionCache;
    private readonly roleHierarchy;
    constructor(configService: ConfigService);
    private initializeRoleHierarchy;
    getRolePermissions(role: UserRole): Permission[];
    hasPermission(role: UserRole, permission: Permission): boolean;
    hasAnyPermission(role: UserRole, permissions: Permission[]): boolean;
    hasAllPermissions(role: UserRole, permissions: Permission[]): boolean;
    getPermissionsByCategory(category: string): Permission[];
    clearCache(): void;
    getRoleHierarchy(): Map<UserRole, RolePermissions>;
    isRoleHigher(role1: UserRole, role2: UserRole): boolean;
}
