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
exports.AuditInterceptor = exports.AuditEntityType = exports.AUDIT_ENTITY_TYPE_KEY = exports.SkipAudit = exports.SKIP_AUDIT_KEY = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const core_1 = require("@nestjs/core");
const audit_service_1 = require("./audit.service");
const audit_log_schema_1 = require("../database/schemas/audit-log.schema");
exports.SKIP_AUDIT_KEY = 'skipAudit';
const SkipAudit = () => core_1.Reflector.createDecorator({ key: exports.SKIP_AUDIT_KEY });
exports.SkipAudit = SkipAudit;
exports.AUDIT_ENTITY_TYPE_KEY = 'auditEntityType';
const AuditEntityType = (entityType) => core_1.Reflector.createDecorator({ key: exports.AUDIT_ENTITY_TYPE_KEY });
exports.AuditEntityType = AuditEntityType;
let AuditInterceptor = class AuditInterceptor {
    constructor(auditService, reflector) {
        this.auditService = auditService;
        this.reflector = reflector;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const skipAudit = this.reflector.getAllAndOverride(exports.SKIP_AUDIT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipAudit) {
            return next.handle();
        }
        const method = request.method;
        const url = request.url;
        const user = request.user;
        const body = request.body;
        const params = request.params;
        const query = request.query;
        const action = this.getAuditAction(method, url);
        if (!action) {
            return next.handle();
        }
        const entityType = this.reflector.getAllAndOverride(exports.AUDIT_ENTITY_TYPE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) || this.inferEntityType(url);
        if (!entityType) {
            return next.handle();
        }
        const entityId = this.extractEntityId(params, body, action);
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: (responseData) => {
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
        }));
    }
    getAuditAction(method, url) {
        switch (method.toUpperCase()) {
            case 'POST':
                return audit_log_schema_1.AuditAction.CREATE;
            case 'PUT':
            case 'PATCH':
                if (url.includes('/archive') || url.includes('/restore')) {
                    return url.includes('/archive') ? audit_log_schema_1.AuditAction.ARCHIVE : audit_log_schema_1.AuditAction.RESTORE;
                }
                return audit_log_schema_1.AuditAction.UPDATE;
            case 'DELETE':
                return audit_log_schema_1.AuditAction.DELETE;
            case 'GET':
                if (url.includes('/export') || url.includes('/download')) {
                    return audit_log_schema_1.AuditAction.READ;
                }
                return null;
            default:
                return null;
        }
    }
    inferEntityType(url) {
        if (url.includes('/users'))
            return audit_log_schema_1.AuditEntityType.USER;
        if (url.includes('/employees'))
            return audit_log_schema_1.AuditEntityType.EMPLOYEE;
        if (url.includes('/projects'))
            return audit_log_schema_1.AuditEntityType.PROJECT;
        if (url.includes('/files'))
            return audit_log_schema_1.AuditEntityType.FILE;
        if (url.includes('/auth'))
            return audit_log_schema_1.AuditEntityType.AUTH;
        return null;
    }
    extractEntityId(params, body, action) {
        if (params?.id)
            return params.id;
        if (params?.userId)
            return params.userId;
        if (params?.employeeId)
            return params.employeeId;
        if (params?.projectId)
            return params.projectId;
        if (action === audit_log_schema_1.AuditAction.CREATE) {
            return null;
        }
        return null;
    }
    extractEntityIdFromResponse(responseData) {
        if (!responseData)
            return 'unknown';
        if (responseData.id)
            return responseData.id;
        if (responseData._id)
            return responseData._id;
        if (responseData.userId)
            return responseData.userId;
        if (responseData.employeeId)
            return responseData.employeeId;
        if (responseData.projectId)
            return responseData.projectId;
        return 'unknown';
    }
    extractChanges(action, body, responseData) {
        if (action === audit_log_schema_1.AuditAction.CREATE) {
            return { created: true };
        }
        if (action === audit_log_schema_1.AuditAction.UPDATE && body) {
            const changes = {};
            Object.keys(body).forEach(key => {
                if (body[key] !== undefined && body[key] !== null) {
                    changes[key] = body[key];
                }
            });
            return changes;
        }
        if (action === audit_log_schema_1.AuditAction.DELETE) {
            return { deleted: true };
        }
        if (action === audit_log_schema_1.AuditAction.ARCHIVE) {
            return { archived: true };
        }
        if (action === audit_log_schema_1.AuditAction.RESTORE) {
            return { restored: true };
        }
        return {};
    }
    extractOldValues(action, body) {
        if (action === audit_log_schema_1.AuditAction.UPDATE) {
            return {};
        }
        return undefined;
    }
    extractNewValues(action, body, responseData) {
        if (action === audit_log_schema_1.AuditAction.CREATE && responseData) {
            return this.sanitizeData(responseData);
        }
        if (action === audit_log_schema_1.AuditAction.UPDATE && body) {
            return this.sanitizeData(body);
        }
        return undefined;
    }
    sanitizeData(data) {
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
    sanitizeQuery(query) {
        if (!query || typeof query !== 'object') {
            return query;
        }
        const sanitized = { ...query };
        delete sanitized.password;
        delete sanitized.token;
        delete sanitized.secret;
        return sanitized;
    }
    getClientIp(request) {
        return (request.headers['x-forwarded-for'] ||
            request.headers['x-real-ip'] ||
            request.connection?.remoteAddress ||
            request.socket?.remoteAddress ||
            request.ip ||
            'unknown');
    }
    async createAuditLog(data) {
        try {
            await this.auditService.createAuditLog(data);
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService,
        core_1.Reflector])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map