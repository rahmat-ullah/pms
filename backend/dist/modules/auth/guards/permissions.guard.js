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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProjectMember = exports.isTeamMember = exports.isResourceOwner = exports.RequireResourcePermission = exports.RequireContextPermission = exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permissions_service_1 = require("../services/permissions.service");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
let PermissionsGuard = class PermissionsGuard {
    constructor(reflector, permissionsService) {
        this.reflector = reflector;
        this.permissionsService = permissionsService;
    }
    canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const requireAll = this.reflector.getAllAndOverride(permissions_decorator_1.REQUIRE_ALL_PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? false;
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        const hasPermission = requireAll
            ? this.permissionsService.hasAllPermissions(user.role, requiredPermissions)
            : this.permissionsService.hasAnyPermission(user.role, requiredPermissions);
        if (!hasPermission) {
            const permissionNames = requiredPermissions.join(', ');
            const operator = requireAll ? 'all' : 'any';
            throw new common_1.ForbiddenException(`Access denied. Required ${operator} of these permissions: ${permissionNames}`);
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        permissions_service_1.PermissionsService])
], PermissionsGuard);
const RequireContextPermission = (permission, contextExtractor) => {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const request = args.find(arg => arg && arg.user);
            const user = request?.user;
            if (!user) {
                throw new common_1.ForbiddenException('User not authenticated');
            }
            let context = null;
            if (contextExtractor && request) {
                context = contextExtractor(request);
            }
            const permissionsService = new permissions_service_1.PermissionsService(null);
            const hasPermission = permissionsService.hasPermission(user.role, permission);
            if (!hasPermission) {
                throw new common_1.ForbiddenException(`Access denied. Required permission: ${permission}`);
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
};
exports.RequireContextPermission = RequireContextPermission;
const RequireResourcePermission = (resource, action, ownershipCheck) => {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const request = args.find(arg => arg && arg.user);
            const user = request?.user;
            if (!user) {
                throw new common_1.ForbiddenException('User not authenticated');
            }
            const permission = `${resource}.${action}`;
            const permissionsService = new permissions_service_1.PermissionsService(null);
            let hasPermission = permissionsService.hasPermission(user.role, permission);
            if (!hasPermission && ownershipCheck) {
                const resourceData = args.find(arg => arg && typeof arg === 'object' && arg.id);
                if (resourceData && ownershipCheck(user, resourceData)) {
                    hasPermission = true;
                }
            }
            if (!hasPermission) {
                throw new common_1.ForbiddenException(`Access denied. Required permission: ${permission}`);
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
};
exports.RequireResourcePermission = RequireResourcePermission;
const isResourceOwner = (user, resource) => {
    if (!resource)
        return false;
    if (resource.userId && resource.userId.toString() === user._id.toString()) {
        return true;
    }
    if (resource.createdBy && resource.createdBy.toString() === user._id.toString()) {
        return true;
    }
    if (resource.ownerId && resource.ownerId.toString() === user._id.toString()) {
        return true;
    }
    if (resource.user && resource.user.toString() === user._id.toString()) {
        return true;
    }
    return false;
};
exports.isResourceOwner = isResourceOwner;
const isTeamMember = (user, resource) => {
    if (!resource || !resource.teamMembers)
        return false;
    return resource.teamMembers.some((member) => member.toString() === user._id.toString());
};
exports.isTeamMember = isTeamMember;
const isProjectMember = (user, project) => {
    if (!project)
        return false;
    if (project.managerId && project.managerId.toString() === user._id.toString()) {
        return true;
    }
    if (project.teamMembers && project.teamMembers.some((member) => member.toString() === user._id.toString())) {
        return true;
    }
    return false;
};
exports.isProjectMember = isProjectMember;
//# sourceMappingURL=permissions.guard.js.map