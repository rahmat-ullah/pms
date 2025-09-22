import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuditService } from './audit.service';
import { AuditEntityType as AuditEntityTypeEnum } from '../database/schemas/audit-log.schema';
export declare const SKIP_AUDIT_KEY = "skipAudit";
export declare const SkipAudit: () => import("@nestjs/core").ReflectableDecorator<boolean, boolean>;
export declare const AUDIT_ENTITY_TYPE_KEY = "auditEntityType";
export declare const AuditEntityType: (entityType: AuditEntityTypeEnum) => import("@nestjs/core").ReflectableDecorator<AuditEntityTypeEnum, AuditEntityTypeEnum>;
export declare class AuditInterceptor implements NestInterceptor {
    private readonly auditService;
    private readonly reflector;
    constructor(auditService: AuditService, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private getAuditAction;
    private inferEntityType;
    private extractEntityId;
    private extractEntityIdFromResponse;
    private extractChanges;
    private extractOldValues;
    private extractNewValues;
    private sanitizeData;
    private sanitizeQuery;
    private getClientIp;
    private createAuditLog;
}
