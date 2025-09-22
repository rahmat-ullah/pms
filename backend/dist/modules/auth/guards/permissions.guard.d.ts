import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService, Permission } from '../services/permissions.service';
import { UserDocument } from '../../../shared/database/schemas/user.schema';
export declare class PermissionsGuard implements CanActivate {
    private reflector;
    private permissionsService;
    constructor(reflector: Reflector, permissionsService: PermissionsService);
    canActivate(context: ExecutionContext): boolean;
}
export declare const RequireContextPermission: (permission: Permission, contextExtractor?: (request: any) => any) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const RequireResourcePermission: (resource: string, action: string, ownershipCheck?: (user: UserDocument, resource: any) => boolean) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const isResourceOwner: (user: UserDocument, resource: any) => boolean;
export declare const isTeamMember: (user: UserDocument, resource: any) => boolean;
export declare const isProjectMember: (user: UserDocument, project: any) => boolean;
