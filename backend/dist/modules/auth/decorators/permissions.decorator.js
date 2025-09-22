"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireOwnershipOrAdmin = exports.RequireManagerPermission = exports.RequireHRPermission = exports.RequireAdminPermission = exports.RequireFilePermission = exports.RequireSystemPermission = exports.RequireReportsPermission = exports.RequirePayrollPermission = exports.RequireFinancePermission = exports.RequireLeavePermission = exports.RequireAttendancePermission = exports.RequireProjectPermission = exports.RequireEmployeePermission = exports.RequireUserPermission = exports.RequirePermission = exports.RequireAllPermissions = exports.RequirePermissions = exports.REQUIRE_ALL_PERMISSIONS_KEY = exports.PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
const permissions_service_1 = require("../services/permissions.service");
exports.PERMISSIONS_KEY = 'permissions';
exports.REQUIRE_ALL_PERMISSIONS_KEY = 'require_all_permissions';
const RequirePermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequirePermissions = RequirePermissions;
const RequireAllPermissions = (...permissions) => {
    return (target, propertyKey, descriptor) => {
        (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions)(target, propertyKey, descriptor);
        (0, common_1.SetMetadata)(exports.REQUIRE_ALL_PERMISSIONS_KEY, true)(target, propertyKey, descriptor);
    };
};
exports.RequireAllPermissions = RequireAllPermissions;
const RequirePermission = (permission) => (0, exports.RequirePermissions)(permission);
exports.RequirePermission = RequirePermission;
const RequireUserPermission = (action) => {
    const permissionMap = {
        create: permissions_service_1.Permission.USER_CREATE,
        read: permissions_service_1.Permission.USER_READ,
        update: permissions_service_1.Permission.USER_UPDATE,
        delete: permissions_service_1.Permission.USER_DELETE,
        list: permissions_service_1.Permission.USER_LIST,
        assign_roles: permissions_service_1.Permission.USER_ASSIGN_ROLES,
        manage_permissions: permissions_service_1.Permission.USER_MANAGE_PERMISSIONS,
    };
    return (0, exports.RequirePermission)(permissionMap[action]);
};
exports.RequireUserPermission = RequireUserPermission;
const RequireEmployeePermission = (action) => {
    const permissionMap = {
        create: permissions_service_1.Permission.EMPLOYEE_CREATE,
        read: permissions_service_1.Permission.EMPLOYEE_READ,
        update: permissions_service_1.Permission.EMPLOYEE_UPDATE,
        delete: permissions_service_1.Permission.EMPLOYEE_DELETE,
        list: permissions_service_1.Permission.EMPLOYEE_LIST,
        manage_profile: permissions_service_1.Permission.EMPLOYEE_MANAGE_PROFILE,
        view_salary: permissions_service_1.Permission.EMPLOYEE_VIEW_SALARY,
        manage_skills: permissions_service_1.Permission.EMPLOYEE_MANAGE_SKILLS,
    };
    return (0, exports.RequirePermission)(permissionMap[action]);
};
exports.RequireEmployeePermission = RequireEmployeePermission;
const RequireProjectPermission = (action) => {
    const permissionMap = {
        create: permissions_service_1.Permission.PROJECT_CREATE,
        read: permissions_service_1.Permission.PROJECT_READ,
        update: permissions_service_1.Permission.PROJECT_UPDATE,
        delete: permissions_service_1.Permission.PROJECT_DELETE,
        list: permissions_service_1.Permission.PROJECT_LIST,
        assign_members: permissions_service_1.Permission.PROJECT_ASSIGN_MEMBERS,
        manage_budget: permissions_service_1.Permission.PROJECT_MANAGE_BUDGET,
        view_reports: permissions_service_1.Permission.PROJECT_VIEW_REPORTS,
    };
    return (0, exports.RequirePermission)(permissionMap[action]);
};
exports.RequireProjectPermission = RequireProjectPermission;
const RequireAttendancePermission = (action) => {
    const permissionMap = {
        create: permissions_service_1.Permission.ATTENDANCE_CREATE,
        read: permissions_service_1.Permission.ATTENDANCE_READ,
        update: permissions_service_1.Permission.ATTENDANCE_UPDATE,
        delete: permissions_service_1.Permission.ATTENDANCE_DELETE,
        approve: permissions_service_1.Permission.ATTENDANCE_APPROVE,
        view_reports: permissions_service_1.Permission.ATTENDANCE_VIEW_REPORTS,
    };
    return (0, exports.RequirePermission)(permissionMap[action]);
};
exports.RequireAttendancePermission = RequireAttendancePermission;
const RequireLeavePermission = (action) => {
    const permissionMap = {
        create: permissions_service_1.Permission.LEAVE_CREATE,
        read: permissions_service_1.Permission.LEAVE_READ,
        update: permissions_service_1.Permission.LEAVE_UPDATE,
        delete: permissions_service_1.Permission.LEAVE_DELETE,
        approve: permissions_service_1.Permission.LEAVE_APPROVE,
        reject: permissions_service_1.Permission.LEAVE_REJECT,
        view_reports: permissions_service_1.Permission.LEAVE_VIEW_REPORTS,
    };
    return (0, exports.RequirePermission)(permissionMap[action]);
};
exports.RequireLeavePermission = RequireLeavePermission;
const RequireFinancePermission = (action) => {
    const permissionMap = {
        read: permissions_service_1.Permission.FINANCE_READ,
        manage: permissions_service_1.Permission.FINANCE_MANAGE,
    };
    return (0, exports.RequirePermission)(permissionMap[action]);
};
exports.RequireFinancePermission = RequireFinancePermission;
const RequirePayrollPermission = (action) => {
    const permissionMap = {
        read: permissions_service_1.Permission.PAYROLL_READ,
        manage: permissions_service_1.Permission.PAYROLL_MANAGE,
    };
    return (0, exports.RequirePermission)(permissionMap[action]);
};
exports.RequirePayrollPermission = RequirePayrollPermission;
const RequireReportsPermission = (action) => {
    const permissionMap = {
        view: permissions_service_1.Permission.REPORTS_VIEW,
        create: permissions_service_1.Permission.REPORTS_CREATE,
        export: permissions_service_1.Permission.REPORTS_EXPORT,
    };
    return (0, exports.RequirePermission)(permissionMap[action]);
};
exports.RequireReportsPermission = RequireReportsPermission;
const RequireSystemPermission = (action) => {
    const permissionMap = {
        settings: permissions_service_1.Permission.SYSTEM_SETTINGS,
        backup: permissions_service_1.Permission.SYSTEM_BACKUP,
        logs: permissions_service_1.Permission.SYSTEM_LOGS,
        audit: permissions_service_1.Permission.SYSTEM_AUDIT,
    };
    return (0, exports.RequirePermission)(permissionMap[action]);
};
exports.RequireSystemPermission = RequireSystemPermission;
const RequireFilePermission = (action) => {
    const permissionMap = {
        upload: permissions_service_1.Permission.FILE_UPLOAD,
        download: permissions_service_1.Permission.FILE_DOWNLOAD,
        delete: permissions_service_1.Permission.FILE_DELETE,
        manage: permissions_service_1.Permission.FILE_MANAGE,
    };
    return (0, exports.RequirePermission)(permissionMap[action]);
};
exports.RequireFilePermission = RequireFilePermission;
const RequireAdminPermission = () => (0, exports.RequirePermissions)(permissions_service_1.Permission.SYSTEM_SETTINGS);
exports.RequireAdminPermission = RequireAdminPermission;
const RequireHRPermission = () => (0, exports.RequirePermissions)(permissions_service_1.Permission.EMPLOYEE_CREATE, permissions_service_1.Permission.EMPLOYEE_UPDATE, permissions_service_1.Permission.EMPLOYEE_LIST, permissions_service_1.Permission.USER_CREATE, permissions_service_1.Permission.USER_UPDATE);
exports.RequireHRPermission = RequireHRPermission;
const RequireManagerPermission = () => (0, exports.RequirePermissions)(permissions_service_1.Permission.PROJECT_CREATE, permissions_service_1.Permission.PROJECT_UPDATE, permissions_service_1.Permission.PROJECT_ASSIGN_MEMBERS, permissions_service_1.Permission.EMPLOYEE_MANAGE_SKILLS);
exports.RequireManagerPermission = RequireManagerPermission;
const RequireOwnershipOrAdmin = () => (0, exports.RequirePermissions)(permissions_service_1.Permission.SYSTEM_SETTINGS);
exports.RequireOwnershipOrAdmin = RequireOwnershipOrAdmin;
//# sourceMappingURL=permissions.decorator.js.map