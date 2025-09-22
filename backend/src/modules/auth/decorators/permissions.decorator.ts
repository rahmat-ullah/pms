import { SetMetadata } from '@nestjs/common';
import { Permission } from '../services/permissions.service';

export const PERMISSIONS_KEY = 'permissions';
export const REQUIRE_ALL_PERMISSIONS_KEY = 'require_all_permissions';

/**
 * Decorator to require specific permissions (user needs ANY of the specified permissions)
 */
export const RequirePermissions = (...permissions: Permission[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to require ALL specified permissions
 */
export const RequireAllPermissions = (...permissions: Permission[]) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    SetMetadata(PERMISSIONS_KEY, permissions)(target, propertyKey, descriptor);
    SetMetadata(REQUIRE_ALL_PERMISSIONS_KEY, true)(target, propertyKey, descriptor);
  };
};

/**
 * Decorator to require a single permission
 */
export const RequirePermission = (permission: Permission) => 
  RequirePermissions(permission);

/**
 * Decorator for user management permissions
 */
export const RequireUserPermission = (action: 'create' | 'read' | 'update' | 'delete' | 'list' | 'assign_roles' | 'manage_permissions') => {
  const permissionMap = {
    create: Permission.USER_CREATE,
    read: Permission.USER_READ,
    update: Permission.USER_UPDATE,
    delete: Permission.USER_DELETE,
    list: Permission.USER_LIST,
    assign_roles: Permission.USER_ASSIGN_ROLES,
    manage_permissions: Permission.USER_MANAGE_PERMISSIONS,
  };
  return RequirePermission(permissionMap[action]);
};

/**
 * Decorator for employee management permissions
 */
export const RequireEmployeePermission = (action: 'create' | 'read' | 'update' | 'delete' | 'list' | 'manage_profile' | 'view_salary' | 'manage_skills') => {
  const permissionMap = {
    create: Permission.EMPLOYEE_CREATE,
    read: Permission.EMPLOYEE_READ,
    update: Permission.EMPLOYEE_UPDATE,
    delete: Permission.EMPLOYEE_DELETE,
    list: Permission.EMPLOYEE_LIST,
    manage_profile: Permission.EMPLOYEE_MANAGE_PROFILE,
    view_salary: Permission.EMPLOYEE_VIEW_SALARY,
    manage_skills: Permission.EMPLOYEE_MANAGE_SKILLS,
  };
  return RequirePermission(permissionMap[action]);
};

/**
 * Decorator for project management permissions
 */
export const RequireProjectPermission = (action: 'create' | 'read' | 'update' | 'delete' | 'list' | 'assign_members' | 'manage_budget' | 'view_reports') => {
  const permissionMap = {
    create: Permission.PROJECT_CREATE,
    read: Permission.PROJECT_READ,
    update: Permission.PROJECT_UPDATE,
    delete: Permission.PROJECT_DELETE,
    list: Permission.PROJECT_LIST,
    assign_members: Permission.PROJECT_ASSIGN_MEMBERS,
    manage_budget: Permission.PROJECT_MANAGE_BUDGET,
    view_reports: Permission.PROJECT_VIEW_REPORTS,
  };
  return RequirePermission(permissionMap[action]);
};

/**
 * Decorator for attendance management permissions
 */
export const RequireAttendancePermission = (action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'view_reports') => {
  const permissionMap = {
    create: Permission.ATTENDANCE_CREATE,
    read: Permission.ATTENDANCE_READ,
    update: Permission.ATTENDANCE_UPDATE,
    delete: Permission.ATTENDANCE_DELETE,
    approve: Permission.ATTENDANCE_APPROVE,
    view_reports: Permission.ATTENDANCE_VIEW_REPORTS,
  };
  return RequirePermission(permissionMap[action]);
};

/**
 * Decorator for leave management permissions
 */
export const RequireLeavePermission = (action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject' | 'view_reports') => {
  const permissionMap = {
    create: Permission.LEAVE_CREATE,
    read: Permission.LEAVE_READ,
    update: Permission.LEAVE_UPDATE,
    delete: Permission.LEAVE_DELETE,
    approve: Permission.LEAVE_APPROVE,
    reject: Permission.LEAVE_REJECT,
    view_reports: Permission.LEAVE_VIEW_REPORTS,
  };
  return RequirePermission(permissionMap[action]);
};

/**
 * Decorator for finance permissions
 */
export const RequireFinancePermission = (action: 'read' | 'manage') => {
  const permissionMap = {
    read: Permission.FINANCE_READ,
    manage: Permission.FINANCE_MANAGE,
  };
  return RequirePermission(permissionMap[action]);
};

/**
 * Decorator for payroll permissions
 */
export const RequirePayrollPermission = (action: 'read' | 'manage') => {
  const permissionMap = {
    read: Permission.PAYROLL_READ,
    manage: Permission.PAYROLL_MANAGE,
  };
  return RequirePermission(permissionMap[action]);
};

/**
 * Decorator for reports permissions
 */
export const RequireReportsPermission = (action: 'view' | 'create' | 'export') => {
  const permissionMap = {
    view: Permission.REPORTS_VIEW,
    create: Permission.REPORTS_CREATE,
    export: Permission.REPORTS_EXPORT,
  };
  return RequirePermission(permissionMap[action]);
};

/**
 * Decorator for system administration permissions
 */
export const RequireSystemPermission = (action: 'settings' | 'backup' | 'logs' | 'audit') => {
  const permissionMap = {
    settings: Permission.SYSTEM_SETTINGS,
    backup: Permission.SYSTEM_BACKUP,
    logs: Permission.SYSTEM_LOGS,
    audit: Permission.SYSTEM_AUDIT,
  };
  return RequirePermission(permissionMap[action]);
};

/**
 * Decorator for file management permissions
 */
export const RequireFilePermission = (action: 'upload' | 'download' | 'delete' | 'manage') => {
  const permissionMap = {
    upload: Permission.FILE_UPLOAD,
    download: Permission.FILE_DOWNLOAD,
    delete: Permission.FILE_DELETE,
    manage: Permission.FILE_MANAGE,
  };
  return RequirePermission(permissionMap[action]);
};

/**
 * Decorator for admin-only operations
 */
export const RequireAdminPermission = () => 
  RequirePermissions(Permission.SYSTEM_SETTINGS);

/**
 * Decorator for HR-specific operations
 */
export const RequireHRPermission = () => 
  RequirePermissions(
    Permission.EMPLOYEE_CREATE,
    Permission.EMPLOYEE_UPDATE,
    Permission.EMPLOYEE_LIST,
    Permission.USER_CREATE,
    Permission.USER_UPDATE
  );

/**
 * Decorator for manager-level operations
 */
export const RequireManagerPermission = () => 
  RequirePermissions(
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_ASSIGN_MEMBERS,
    Permission.EMPLOYEE_MANAGE_SKILLS
  );

/**
 * Decorator for operations that require ownership or admin access
 */
export const RequireOwnershipOrAdmin = () => 
  RequirePermissions(
    Permission.SYSTEM_SETTINGS, // Admin permission
    // Ownership will be checked in the guard/service logic
  );
