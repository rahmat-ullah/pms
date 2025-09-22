import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditService, CreateAuditLogData } from './audit.service';
import { AuditAction, AuditEntityType as AuditEntityTypeEnum } from '../database/schemas/audit-log.schema';

// Decorator to skip audit logging for specific endpoints
export const SKIP_AUDIT_KEY = 'skipAudit';
export const SkipAudit = () => Reflector.createDecorator<boolean>({ key: SKIP_AUDIT_KEY });

// Decorator to specify audit entity type
export const AUDIT_ENTITY_TYPE_KEY = 'auditEntityType';
export const AuditEntityType = (entityType: AuditEntityTypeEnum) =>
  Reflector.createDecorator<AuditEntityTypeEnum>({ key: AUDIT_ENTITY_TYPE_KEY });

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Check if audit logging should be skipped
    const skipAudit = this.reflector.getAllAndOverride<boolean>(SKIP_AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipAudit) {
      return next.handle();
    }

    // Extract audit information
    const method = request.method;
    const url = request.url;
    const user = request.user;
    const body = request.body;
    const params = request.params;
    const query = request.query;

    // Determine audit action based on HTTP method
    const action = this.getAuditAction(method, url);
    
    // Skip if not an auditable action
    if (!action) {
      return next.handle();
    }

    // Get entity type from decorator or infer from URL
    const entityType = this.reflector.getAllAndOverride<AuditEntityTypeEnum>(AUDIT_ENTITY_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || this.inferEntityType(url);

    // Skip if entity type cannot be determined
    if (!entityType) {
      return next.handle();
    }

    // Extract entity ID from params or body
    const entityId = this.extractEntityId(params, body, action);

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          // Only log successful operations
          if (response.statusCode < 400) {
            this.createAuditLog({
              action,
              entityType,
              entityId: entityId || this.extractEntityIdFromResponse(responseData),
              userId: user?.id,
              userEmail: user?.email,
              ipAddress: this.getClientIp(request),
              userAgent: request.get('User-Agent'),
              changes: this.extractChanges(action, body, responseData),
              oldValues: this.extractOldValues(action, body),
              newValues: this.extractNewValues(action, body, responseData),
              metadata: {
                method,
                url,
                params,
                query: this.sanitizeQuery(query),
                responseTime: Date.now() - startTime,
                statusCode: response.statusCode,
              },
            });
          }
        },
        error: (error) => {
          // Log failed operations as well
          this.createAuditLog({
            action,
            entityType,
            entityId: entityId || 'unknown',
            userId: user?.id,
            userEmail: user?.email,
            ipAddress: this.getClientIp(request),
            userAgent: request.get('User-Agent'),
            changes: {},
            metadata: {
              method,
              url,
              params,
              query: this.sanitizeQuery(query),
              responseTime: Date.now() - startTime,
              statusCode: response.statusCode || 500,
              error: {
                message: error.message,
                name: error.name,
              },
            },
          });
        },
      }),
    );
  }

  private getAuditAction(method: string, url: string): AuditAction | null {
    switch (method.toUpperCase()) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        if (url.includes('/archive') || url.includes('/restore')) {
          return url.includes('/archive') ? AuditAction.ARCHIVE : AuditAction.RESTORE;
        }
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      case 'GET':
        // Only log specific GET operations
        if (url.includes('/export') || url.includes('/download')) {
          return AuditAction.READ;
        }
        return null; // Don't log regular GET requests
      default:
        return null;
    }
  }

  private inferEntityType(url: string): AuditEntityTypeEnum | null {
    if (url.includes('/users')) return AuditEntityTypeEnum.USER;
    if (url.includes('/employees')) return AuditEntityTypeEnum.EMPLOYEE;
    if (url.includes('/projects')) return AuditEntityTypeEnum.PROJECT;
    if (url.includes('/files')) return AuditEntityTypeEnum.FILE;
    if (url.includes('/auth')) return AuditEntityTypeEnum.AUTH;
    return null;
  }

  private extractEntityId(params: any, body: any, action: AuditAction): string | null {
    // For updates/deletes, entity ID is usually in params
    if (params?.id) return params.id;
    if (params?.userId) return params.userId;
    if (params?.employeeId) return params.employeeId;
    if (params?.projectId) return params.projectId;

    // For creates, we might not have the ID yet
    if (action === AuditAction.CREATE) {
      return null; // Will be extracted from response
    }

    return null;
  }

  private extractEntityIdFromResponse(responseData: any): string {
    if (!responseData) return 'unknown';
    
    // Try common ID field names
    if (responseData.id) return responseData.id;
    if (responseData._id) return responseData._id;
    if (responseData.userId) return responseData.userId;
    if (responseData.employeeId) return responseData.employeeId;
    if (responseData.projectId) return responseData.projectId;

    return 'unknown';
  }

  private extractChanges(action: AuditAction, body: any, responseData: any): Record<string, any> {
    if (action === AuditAction.CREATE) {
      return { created: true };
    }

    if (action === AuditAction.UPDATE && body) {
      // Return the fields that were updated
      const changes: Record<string, any> = {};
      Object.keys(body).forEach(key => {
        if (body[key] !== undefined && body[key] !== null) {
          changes[key] = body[key];
        }
      });
      return changes;
    }

    if (action === AuditAction.DELETE) {
      return { deleted: true };
    }

    if (action === AuditAction.ARCHIVE) {
      return { archived: true };
    }

    if (action === AuditAction.RESTORE) {
      return { restored: true };
    }

    return {};
  }

  private extractOldValues(action: AuditAction, body: any): Record<string, any> | undefined {
    // For updates, we would need to fetch the old values from the database
    // This is a simplified implementation
    if (action === AuditAction.UPDATE) {
      return {}; // Could be enhanced to fetch old values
    }
    return undefined;
  }

  private extractNewValues(action: AuditAction, body: any, responseData: any): Record<string, any> | undefined {
    if (action === AuditAction.CREATE && responseData) {
      return this.sanitizeData(responseData);
    }

    if (action === AuditAction.UPDATE && body) {
      return this.sanitizeData(body);
    }

    return undefined;
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'passwordHash',
      'refreshToken',
      'refreshTokens',
      'emailVerificationToken',
      'passwordResetToken',
    ];

    const sanitized = { ...data };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }

  private sanitizeQuery(query: any): any {
    if (!query || typeof query !== 'object') {
      return query;
    }

    const sanitized = { ...query };
    
    // Remove sensitive query parameters
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;

    return sanitized;
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  private async createAuditLog(data: CreateAuditLogData): Promise<void> {
    try {
      await this.auditService.createAuditLog(data);
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to create audit log:', error);
    }
  }
}
