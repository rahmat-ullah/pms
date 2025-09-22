"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PermissionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = exports.Permission = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const user_schema_1 = require("../../../shared/database/schemas/user.schema");
var Permission;
(function (Permission) {
    Permission["USER_CREATE"] = "user.create";
    Permission["USER_READ"] = "user.read";
    Permission["USER_UPDATE"] = "user.update";
    Permission["USER_DELETE"] = "user.delete";
    Permission["USER_LIST"] = "user.list";
    Permission["USER_ASSIGN_ROLES"] = "user.assign_roles";
    Permission["USER_MANAGE_PERMISSIONS"] = "user.manage_permissions";
    Permission["EMPLOYEE_CREATE"] = "employee.create";
    Permission["EMPLOYEE_READ"] = "employee.read";
    Permission["EMPLOYEE_UPDATE"] = "employee.update";
    Permission["EMPLOYEE_DELETE"] = "employee.delete";
    Permission["EMPLOYEE_LIST"] = "employee.list";
    Permission["EMPLOYEE_MANAGE_PROFILE"] = "employee.manage_profile";
    Permission["EMPLOYEE_VIEW_SALARY"] = "employee.view_salary";
    Permission["EMPLOYEE_MANAGE_SKILLS"] = "employee.manage_skills";
    Permission["PROJECT_CREATE"] = "project.create";
    Permission["PROJECT_READ"] = "project.read";
    Permission["PROJECT_UPDATE"] = "project.update";
    Permission["PROJECT_DELETE"] = "project.delete";
    Permission["PROJECT_LIST"] = "project.list";
    Permission["PROJECT_ASSIGN_MEMBERS"] = "project.assign_members";
    Permission["PROJECT_MANAGE_BUDGET"] = "project.manage_budget";
    Permission["PROJECT_VIEW_REPORTS"] = "project.view_reports";
    Permission["ATTENDANCE_CREATE"] = "attendance.create";
    Permission["ATTENDANCE_READ"] = "attendance.read";
    Permission["ATTENDANCE_UPDATE"] = "attendance.update";
    Permission["ATTENDANCE_DELETE"] = "attendance.delete";
    Permission["ATTENDANCE_APPROVE"] = "attendance.approve";
    Permission["ATTENDANCE_VIEW_REPORTS"] = "attendance.view_reports";
    Permission["LEAVE_CREATE"] = "leave.create";
    Permission["LEAVE_READ"] = "leave.read";
    Permission["LEAVE_UPDATE"] = "leave.update";
    Permission["LEAVE_DELETE"] = "leave.delete";
    Permission["LEAVE_APPROVE"] = "leave.approve";
    Permission["LEAVE_REJECT"] = "leave.reject";
    Permission["LEAVE_VIEW_REPORTS"] = "leave.view_reports";
    Permission["FINANCE_READ"] = "finance.read";
    Permission["FINANCE_MANAGE"] = "finance.manage";
    Permission["PAYROLL_READ"] = "payroll.read";
    Permission["PAYROLL_MANAGE"] = "payroll.manage";
    Permission["BUDGET_READ"] = "budget.read";
    Permission["BUDGET_MANAGE"] = "budget.manage";
    Permission["REPORTS_VIEW"] = "reports.view";
    Permission["REPORTS_CREATE"] = "reports.create";
    Permission["REPORTS_EXPORT"] = "reports.export";
    Permission["ANALYTICS_VIEW"] = "analytics.view";
    Permission["SYSTEM_SETTINGS"] = "system.settings";
    Permission["SYSTEM_BACKUP"] = "system.backup";
    Permission["SYSTEM_LOGS"] = "system.logs";
    Permission["SYSTEM_AUDIT"] = "system.audit";
    Permission["FILE_UPLOAD"] = "file.upload";
    Permission["FILE_DOWNLOAD"] = "file.download";
    Permission["FILE_DELETE"] = "file.delete";
    Permission["FILE_MANAGE"] = "file.manage";
})(Permission || (exports.Permission = Permission = {}));
let PermissionsService = PermissionsService_1 = class PermissionsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PermissionsService_1.name);
        this.permissionCache = new Map();
        this.roleHierarchy = this.initializeRoleHierarchy();
    }
    initializeRoleHierarchy() {
        const hierarchy = new Map();
        hierarchy.set(user_schema_1.UserRole.EMPLOYEE, {
            role: user_schema_1.UserRole.EMPLOYEE,
            permissions: [
                Permission.USER_READ,
                Permission.EMPLOYEE_READ,
                Permission.EMPLOYEE_MANAGE_PROFILE,
                Permission.PROJECT_READ,
                Permission.ATTENDANCE_CREATE,
                Permission.ATTENDANCE_READ,
                Permission.LEAVE_CREATE,
                Permission.LEAVE_READ,
                Permission.FILE_UPLOAD,
                Permission.FILE_DOWNLOAD,
            ],
        });
        hierarchy.set(user_schema_1.UserRole.CONTRACTOR, {
            role: user_schema_1.UserRole.CONTRACTOR,
            permissions: [
                Permission.USER_READ,
                Permission.EMPLOYEE_READ,
                Permission.PROJECT_READ,
                Permission.ATTENDANCE_CREATE,
                Permission.ATTENDANCE_READ,
                Permission.FILE_UPLOAD,
                Permission.FILE_DOWNLOAD,
            ],
        });
        hierarchy.set(user_schema_1.UserRole.TEAM_LEAD, {
            role: user_schema_1.UserRole.TEAM_LEAD,
            permissions: [
                Permission.EMPLOYEE_LIST,
                Permission.EMPLOYEE_UPDATE,
                Permission.PROJECT_UPDATE,
                Permission.PROJECT_ASSIGN_MEMBERS,
                Permission.ATTENDANCE_READ,
                Permission.ATTENDANCE_APPROVE,
                Permission.LEAVE_READ,
                Permission.LEAVE_APPROVE,
                Permission.REPORTS_VIEW,
            ],
            inheritsFrom: [user_schema_1.UserRole.EMPLOYEE],
        });
        hierarchy.set(user_schema_1.UserRole.PROJECT_MANAGER, {
            role: user_schema_1.UserRole.PROJECT_MANAGER,
            permissions: [
                Permission.PROJECT_CREATE,
                Permission.PROJECT_DELETE,
                Permission.PROJECT_MANAGE_BUDGET,
                Permission.PROJECT_VIEW_REPORTS,
                Permission.EMPLOYEE_MANAGE_SKILLS,
                Permission.REPORTS_CREATE,
                Permission.REPORTS_EXPORT,
                Permission.FILE_MANAGE,
            ],
            inheritsFrom: [user_schema_1.UserRole.TEAM_LEAD],
        });
        hierarchy.set(user_schema_1.UserRole.HR_MANAGER, {
            role: user_schema_1.UserRole.HR_MANAGER,
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
            inheritsFrom: [user_schema_1.UserRole.EMPLOYEE],
        });
        hierarchy.set(user_schema_1.UserRole.VIEWER, {
            role: user_schema_1.UserRole.VIEWER,
            permissions: [
                Permission.USER_READ,
                Permission.EMPLOYEE_READ,
                Permission.PROJECT_READ,
                Permission.REPORTS_VIEW,
                Permission.FILE_DOWNLOAD,
            ],
        });
        hierarchy.set(user_schema_1.UserRole.AUDITOR, {
            role: user_schema_1.UserRole.AUDITOR,
            permissions: [
                Permission.SYSTEM_AUDIT,
                Permission.SYSTEM_LOGS,
                Permission.REPORTS_VIEW,
                Permission.REPORTS_EXPORT,
                Permission.ANALYTICS_VIEW,
                Permission.FINANCE_READ,
                Permission.PAYROLL_READ,
            ],
            inheritsFrom: [user_schema_1.UserRole.VIEWER],
        });
        hierarchy.set(user_schema_1.UserRole.ADMIN, {
            role: user_schema_1.UserRole.ADMIN,
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
            inheritsFrom: [user_schema_1.UserRole.HR_MANAGER, user_schema_1.UserRole.PROJECT_MANAGER, user_schema_1.UserRole.AUDITOR],
        });
        hierarchy.set(user_schema_1.UserRole.SUPER_ADMIN, {
            role: user_schema_1.UserRole.SUPER_ADMIN,
            permissions: Object.values(Permission),
        });
        return hierarchy;
    }
    getRolePermissions(role) {
        const cacheKey = `role:${role}`;
        if (this.permissionCache.has(cacheKey)) {
            return this.permissionCache.get(cacheKey);
        }
        const roleConfig = this.roleHierarchy.get(role);
        if (!roleConfig) {
            this.logger.warn(`Role not found in hierarchy: ${role}`);
            return [];
        }
        let permissions = new Set(roleConfig.permissions);
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
    hasPermission(role, permission) {
        const rolePermissions = this.getRolePermissions(role);
        return rolePermissions.includes(permission);
    }
    hasAnyPermission(role, permissions) {
        return permissions.some(permission => this.hasPermission(role, permission));
    }
    hasAllPermissions(role, permissions) {
        return permissions.every(permission => this.hasPermission(role, permission));
    }
    getPermissionsByCategory(category) {
        return Object.values(Permission).filter(permission => permission.startsWith(category.toLowerCase()));
    }
    clearCache() {
        this.permissionCache.clear();
        this.logger.log('Permission cache cleared');
    }
    getRoleHierarchy() {
        return new Map(this.roleHierarchy);
    }
    isRoleHigher(role1, role2) {
        const hierarchy = [
            user_schema_1.UserRole.CONTRACTOR,
            user_schema_1.UserRole.EMPLOYEE,
            user_schema_1.UserRole.VIEWER,
            user_schema_1.UserRole.TEAM_LEAD,
            user_schema_1.UserRole.PROJECT_MANAGER,
            user_schema_1.UserRole.HR_MANAGER,
            user_schema_1.UserRole.AUDITOR,
            user_schema_1.UserRole.ADMIN,
            user_schema_1.UserRole.SUPER_ADMIN,
        ];
        const index1 = hierarchy.indexOf(role1);
        const index2 = hierarchy.indexOf(role2);
        return index1 > index2;
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = PermissionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map