import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../../shared/database/schemas/user.schema';

// Define comprehensive permission system
export enum Permission {
  // User Management
  USER_CREATE = 'user.create',
  USER_READ = 'user.read',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_LIST = 'user.list',
  USER_ASSIGN_ROLES = 'user.assign_roles',
  USER_MANAGE_PERMISSIONS = 'user.manage_permissions',

  // Employee Management
  EMPLOYEE_CREATE = 'employee.create',
  EMPLOYEE_READ = 'employee.read',
  EMPLOYEE_UPDATE = 'employee.update',
  EMPLOYEE_DELETE = 'employee.delete',
  EMPLOYEE_LIST = 'employee.list',
  EMPLOYEE_MANAGE_PROFILE = 'employee.manage_profile',
  EMPLOYEE_VIEW_SALARY = 'employee.view_salary',
  EMPLOYEE_MANAGE_SKILLS = 'employee.manage_skills',

  // Project Management
  PROJECT_CREATE = 'project.create',
  PROJECT_READ = 'project.read',
  PROJECT_UPDATE = 'project.update',
  PROJECT_DELETE = 'project.delete',
  PROJECT_LIST = 'project.list',
  PROJECT_ASSIGN_MEMBERS = 'project.assign_members',
  PROJECT_MANAGE_BUDGET = 'project.manage_budget',
  PROJECT_VIEW_REPORTS = 'project.view_reports',

  // Attendance Management
  ATTENDANCE_CREATE = 'attendance.create',
  ATTENDANCE_READ = 'attendance.read',
  ATTENDANCE_UPDATE = 'attendance.update',
  ATTENDANCE_DELETE = 'attendance.delete',
  ATTENDANCE_APPROVE = 'attendance.approve',
  ATTENDANCE_VIEW_REPORTS = 'attendance.view_reports',

  // Leave Management
  LEAVE_CREATE = 'leave.create',
  LEAVE_READ = 'leave.read',
  LEAVE_UPDATE = 'leave.update',
  LEAVE_DELETE = 'leave.delete',
  LEAVE_APPROVE = 'leave.approve',
  LEAVE_REJECT = 'leave.reject',
  LEAVE_VIEW_REPORTS = 'leave.view_reports',

  // Finance & Payroll
  FINANCE_READ = 'finance.read',
  FINANCE_MANAGE = 'finance.manage',
  PAYROLL_READ = 'payroll.read',
  PAYROLL_MANAGE = 'payroll.manage',
  BUDGET_READ = 'budget.read',
  BUDGET_MANAGE = 'budget.manage',

  // Reports & Analytics
  REPORTS_VIEW = 'reports.view',
  REPORTS_CREATE = 'reports.create',
  REPORTS_EXPORT = 'reports.export',
  ANALYTICS_VIEW = 'analytics.view',

  // System Administration
  SYSTEM_SETTINGS = 'system.settings',
  SYSTEM_BACKUP = 'system.backup',
  SYSTEM_LOGS = 'system.logs',
  SYSTEM_AUDIT = 'system.audit',

  // File Management
  FILE_UPLOAD = 'file.upload',
  FILE_DOWNLOAD = 'file.download',
  FILE_DELETE = 'file.delete',
  FILE_MANAGE = 'file.manage',
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  inheritsFrom?: UserRole[];
}

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);
  private readonly permissionCache = new Map<string, Permission[]>();
  private readonly roleHierarchy: Map<UserRole, RolePermissions>;

  constructor(private configService: ConfigService) {
    this.roleHierarchy = this.initializeRoleHierarchy();
  }

  /**
   * Initialize role hierarchy with permissions
   */
  private initializeRoleHierarchy(): Map<UserRole, RolePermissions> {
    const hierarchy = new Map<UserRole, RolePermissions>();

    // Employee - Base level permissions
    hierarchy.set(UserRole.EMPLOYEE, {
      role: UserRole.EMPLOYEE,
      permissions: [
        Permission.USER_READ, // Own profile only
        Permission.EMPLOYEE_READ, // Own profile only
        Permission.EMPLOYEE_MANAGE_PROFILE, // Own profile only
        Permission.PROJECT_READ, // Assigned projects only
        Permission.ATTENDANCE_CREATE,
        Permission.ATTENDANCE_READ, // Own records only
        Permission.LEAVE_CREATE,
        Permission.LEAVE_READ, // Own records only
        Permission.FILE_UPLOAD, // Limited scope
        Permission.FILE_DOWNLOAD,
      ],
    });

    // Contractor - Similar to employee but more restricted
    hierarchy.set(UserRole.CONTRACTOR, {
      role: UserRole.CONTRACTOR,
      permissions: [
        Permission.USER_READ, // Own profile only
        Permission.EMPLOYEE_READ, // Own profile only
        Permission.PROJECT_READ, // Assigned projects only
        Permission.ATTENDANCE_CREATE,
        Permission.ATTENDANCE_READ, // Own records only
        Permission.FILE_UPLOAD, // Very limited scope
        Permission.FILE_DOWNLOAD,
      ],
    });

    // Team Lead - Employee permissions + team management
    hierarchy.set(UserRole.TEAM_LEAD, {
      role: UserRole.TEAM_LEAD,
      permissions: [
        Permission.EMPLOYEE_LIST, // Team members only
        Permission.EMPLOYEE_UPDATE, // Team members only
        Permission.PROJECT_UPDATE, // Assigned projects only
        Permission.PROJECT_ASSIGN_MEMBERS, // Limited scope
        Permission.ATTENDANCE_READ, // Team members only
        Permission.ATTENDANCE_APPROVE, // Team members only
        Permission.LEAVE_READ, // Team members only
        Permission.LEAVE_APPROVE, // Team members only
        Permission.REPORTS_VIEW, // Team reports only
      ],
      inheritsFrom: [UserRole.EMPLOYEE],
    });

    // Project Manager - Team Lead permissions + project management
    hierarchy.set(UserRole.PROJECT_MANAGER, {
      role: UserRole.PROJECT_MANAGER,
      permissions: [
        Permission.PROJECT_CREATE,
        Permission.PROJECT_DELETE,
        Permission.PROJECT_MANAGE_BUDGET,
        Permission.PROJECT_VIEW_REPORTS,
        Permission.EMPLOYEE_MANAGE_SKILLS, // Project team only
        Permission.REPORTS_CREATE,
        Permission.REPORTS_EXPORT,
        Permission.FILE_MANAGE, // Project files only
      ],
      inheritsFrom: [UserRole.TEAM_LEAD],
    });

    // HR Manager - Employee management focus
    hierarchy.set(UserRole.HR_MANAGER, {
      role: UserRole.HR_MANAGER,
      permissions: [
        Permission.USER_CREATE,
        Permission.USER_UPDATE,
        Permission.USER_LIST,
        Permission.EMPLOYEE_CREATE,
        Permission.EMPLOYEE_UPDATE,
        Permission.EMPLOYEE_DELETE,
        Permission.EMPLOYEE_LIST,
        Permission.EMPLOYEE_VIEW_SALARY,
        Permission.LEAVE_APPROVE,
        Permission.LEAVE_REJECT,
        Permission.LEAVE_VIEW_REPORTS,
        Permission.ATTENDANCE_VIEW_REPORTS,
        Permission.PAYROLL_READ,
        Permission.REPORTS_VIEW,
        Permission.REPORTS_CREATE,
      ],
      inheritsFrom: [UserRole.EMPLOYEE],
    });

    // Viewer - Read-only access
    hierarchy.set(UserRole.VIEWER, {
      role: UserRole.VIEWER,
      permissions: [
        Permission.USER_READ,
        Permission.EMPLOYEE_READ,
        Permission.PROJECT_READ,
        Permission.REPORTS_VIEW,
        Permission.FILE_DOWNLOAD,
      ],
    });

    // Auditor - Audit and compliance focus
    hierarchy.set(UserRole.AUDITOR, {
      role: UserRole.AUDITOR,
      permissions: [
        Permission.SYSTEM_AUDIT,
        Permission.SYSTEM_LOGS,
        Permission.REPORTS_VIEW,
        Permission.REPORTS_EXPORT,
        Permission.ANALYTICS_VIEW,
        Permission.FINANCE_READ,
        Permission.PAYROLL_READ,
      ],
      inheritsFrom: [UserRole.VIEWER],
    });

    // Admin - Full system access
    hierarchy.set(UserRole.ADMIN, {
      role: UserRole.ADMIN,
      permissions: [
        Permission.USER_DELETE,
        Permission.USER_ASSIGN_ROLES,
        Permission.USER_MANAGE_PERMISSIONS,
        Permission.SYSTEM_SETTINGS,
        Permission.SYSTEM_BACKUP,
        Permission.FINANCE_MANAGE,
        Permission.PAYROLL_MANAGE,
        Permission.BUDGET_MANAGE,
        Permission.FILE_DELETE,
      ],
      inheritsFrom: [UserRole.HR_MANAGER, UserRole.PROJECT_MANAGER, UserRole.AUDITOR],
    });

    // Super Admin - Unrestricted access
    hierarchy.set(UserRole.SUPER_ADMIN, {
      role: UserRole.SUPER_ADMIN,
      permissions: Object.values(Permission),
    });

    return hierarchy;
  }

  /**
   * Get all permissions for a role (including inherited)
   */
  getRolePermissions(role: UserRole): Permission[] {
    const cacheKey = `role:${role}`;
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const roleConfig = this.roleHierarchy.get(role);
    if (!roleConfig) {
      this.logger.warn(`Role not found in hierarchy: ${role}`);
      return [];
    }

    let permissions = new Set(roleConfig.permissions);

    // Add inherited permissions
    if (roleConfig.inheritsFrom) {
      for (const inheritedRole of roleConfig.inheritsFrom) {
        const inheritedPermissions = this.getRolePermissions(inheritedRole);
        inheritedPermissions.forEach(permission => permissions.add(permission));
      }
    }

    const result = Array.from(permissions);
    this.permissionCache.set(cacheKey, result);
    return result;
  }

  /**
   * Check if a role has a specific permission
   */
  hasPermission(role: UserRole, permission: Permission): boolean {
    const rolePermissions = this.getRolePermissions(role);
    return rolePermissions.includes(permission);
  }

  /**
   * Check if a role has any of the specified permissions
   */
  hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(role, permission));
  }

  /**
   * Check if a role has all of the specified permissions
   */
  hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(role, permission));
  }

  /**
   * Get permissions by category
   */
  getPermissionsByCategory(category: string): Permission[] {
    return Object.values(Permission).filter(permission => 
      permission.startsWith(category.toLowerCase())
    );
  }

  /**
   * Clear permission cache
   */
  clearCache(): void {
    this.permissionCache.clear();
    this.logger.log('Permission cache cleared');
  }

  /**
   * Get role hierarchy information
   */
  getRoleHierarchy(): Map<UserRole, RolePermissions> {
    return new Map(this.roleHierarchy);
  }

  /**
   * Check if one role is higher than another in hierarchy
   */
  isRoleHigher(role1: UserRole, role2: UserRole): boolean {
    const hierarchy = [
      UserRole.CONTRACTOR,
      UserRole.EMPLOYEE,
      UserRole.VIEWER,
      UserRole.TEAM_LEAD,
      UserRole.PROJECT_MANAGER,
      UserRole.HR_MANAGER,
      UserRole.AUDITOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ];

    const index1 = hierarchy.indexOf(role1);
    const index2 = hierarchy.indexOf(role2);
    
    return index1 > index2;
  }
}
