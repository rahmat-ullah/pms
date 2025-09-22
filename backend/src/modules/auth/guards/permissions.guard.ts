import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService, Permission } from '../services/permissions.service';
import { UserDocument } from '../../../shared/database/schemas/user.schema';
import { PERMISSIONS_KEY, REQUIRE_ALL_PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const requireAll = this.reflector.getAllAndOverride<boolean>(REQUIRE_ALL_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? false;

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPermission = requireAll
      ? this.permissionsService.hasAllPermissions(user.role, requiredPermissions)
      : this.permissionsService.hasAnyPermission(user.role, requiredPermissions);

    if (!hasPermission) {
      const permissionNames = requiredPermissions.join(', ');
      const operator = requireAll ? 'all' : 'any';
      throw new ForbiddenException(
        `Access denied. Required ${operator} of these permissions: ${permissionNames}`
      );
    }

    return true;
  }
}

// Note: Permission decorators are now defined in decorators/permissions.decorator.ts

// Context-aware permission checking decorator
export const RequireContextPermission = (
  permission: Permission,
  contextExtractor?: (request: any) => any
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args.find(arg => arg && arg.user);
      const user: UserDocument = request?.user;

      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }

      // Extract context if provided
      let context = null;
      if (contextExtractor && request) {
        context = contextExtractor(request);
      }

      // For now, just check basic permission
      // In a more advanced implementation, you could check context-specific permissions
      const permissionsService = new PermissionsService(null as any); // This would need proper injection
      const hasPermission = permissionsService.hasPermission(user.role, permission);

      if (!hasPermission) {
        throw new ForbiddenException(`Access denied. Required permission: ${permission}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};

// Resource-based permission decorator
export const RequireResourcePermission = (
  resource: string,
  action: string,
  ownershipCheck?: (user: UserDocument, resource: any) => boolean
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args.find(arg => arg && arg.user);
      const user: UserDocument = request?.user;

      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }

      // Construct permission from resource and action
      const permission = `${resource}.${action}` as Permission;
      
      const permissionsService = new PermissionsService(null as any); // This would need proper injection
      let hasPermission = permissionsService.hasPermission(user.role, permission);

      // If user doesn't have general permission, check ownership
      if (!hasPermission && ownershipCheck) {
        const resourceData = args.find(arg => arg && typeof arg === 'object' && arg.id);
        if (resourceData && ownershipCheck(user, resourceData)) {
          hasPermission = true;
        }
      }

      if (!hasPermission) {
        throw new ForbiddenException(`Access denied. Required permission: ${permission}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};

// Helper function to check if user owns a resource
export const isResourceOwner = (user: UserDocument, resource: any): boolean => {
  if (!resource) return false;
  
  // Check various ownership patterns
  if (resource.userId && resource.userId.toString() === user._id.toString()) {
    return true;
  }
  
  if (resource.createdBy && resource.createdBy.toString() === user._id.toString()) {
    return true;
  }
  
  if (resource.ownerId && resource.ownerId.toString() === user._id.toString()) {
    return true;
  }

  // For employee profiles, check if it's the user's own profile
  if (resource.user && resource.user.toString() === user._id.toString()) {
    return true;
  }

  return false;
};

// Team membership check
export const isTeamMember = (user: UserDocument, resource: any): boolean => {
  if (!resource || !resource.teamMembers) return false;
  
  return resource.teamMembers.some((member: any) => 
    member.toString() === user._id.toString()
  );
};

// Project membership check
export const isProjectMember = (user: UserDocument, project: any): boolean => {
  if (!project) return false;
  
  // Check if user is project manager
  if (project.managerId && project.managerId.toString() === user._id.toString()) {
    return true;
  }
  
  // Check if user is in project team
  if (project.teamMembers && project.teamMembers.some((member: any) => 
    member.toString() === user._id.toString()
  )) {
    return true;
  }
  
  return false;
};
