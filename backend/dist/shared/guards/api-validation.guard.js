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
var APIValidationGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrictValidation = exports.ValidateAll = exports.ValidateParams = exports.ValidateQuery = exports.ValidateBody = exports.ValidateAPI = exports.APIValidationGuard = exports.VALIDATION_CONFIG_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
exports.VALIDATION_CONFIG_KEY = 'validation_config';
let APIValidationGuard = APIValidationGuard_1 = class APIValidationGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(APIValidationGuard_1.name);
    }
    async canActivate(context) {
        const validationConfig = this.reflector.getAllAndOverride(exports.VALIDATION_CONFIG_KEY, [context.getHandler(), context.getClass()]);
        if (!validationConfig) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const errors = [];
        if (validationConfig.body && request.body) {
            const bodyErrors = await this.validateObject(request.body, validationConfig.body, 'body', validationConfig);
            errors.push(...bodyErrors);
        }
        if (validationConfig.query && request.query) {
            const queryErrors = await this.validateObject(request.query, validationConfig.query, 'query', validationConfig);
            errors.push(...queryErrors);
        }
        if (validationConfig.params && request.params) {
            const paramErrors = await this.validateObject(request.params, validationConfig.params, 'params', validationConfig);
            errors.push(...paramErrors);
        }
        this.performSecurityValidations(request, errors);
        if (errors.length > 0) {
            this.logger.warn(`Validation failed for ${request.method} ${request.url}: ${errors.join(', ')}`);
            throw new common_1.BadRequestException({
                message: 'Validation failed',
                errors,
            });
        }
        return true;
    }
    async validateObject(obj, dtoClass, type, config) {
        try {
            const dto = (0, class_transformer_1.plainToClass)(dtoClass, obj, {
                excludeExtraneousValues: config.whitelist || false,
            });
            const validationErrors = await (0, class_validator_1.validate)(dto, {
                skipMissingProperties: config.skipMissingProperties || false,
                whitelist: config.whitelist || false,
                forbidNonWhitelisted: config.forbidNonWhitelisted || false,
            });
            const errors = [];
            for (const error of validationErrors) {
                if (error.constraints) {
                    Object.values(error.constraints).forEach(constraint => {
                        errors.push(`${type}.${error.property}: ${constraint}`);
                    });
                }
            }
            return errors;
        }
        catch (error) {
            return [`${type}: Invalid format`];
        }
    }
    performSecurityValidations(request, errors) {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
            /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
            /(--|\/\*|\*\/)/g,
            /(\bUNION\b.*\bSELECT\b)/gi,
        ];
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /eval\s*\(/gi,
            /expression\s*\(/gi,
        ];
        const pathTraversalPatterns = [
            /\.\.\//g,
            /\.\.\\/g,
            /%2e%2e%2f/gi,
            /%2e%2e%5c/gi,
        ];
        const requestString = JSON.stringify({
            url: request.url,
            body: request.body,
            query: request.query,
            params: request.params,
        });
        for (const pattern of sqlPatterns) {
            if (pattern.test(requestString)) {
                errors.push('Potential SQL injection detected');
                break;
            }
        }
        for (const pattern of xssPatterns) {
            if (pattern.test(requestString)) {
                errors.push('Potential XSS attack detected');
                break;
            }
        }
        for (const pattern of pathTraversalPatterns) {
            if (pattern.test(requestString)) {
                errors.push('Potential path traversal attack detected');
                break;
            }
        }
        const maxStringLength = 10000;
        const checkForLongStrings = (obj, path = '') => {
            if (typeof obj === 'string' && obj.length > maxStringLength) {
                errors.push(`String too long at ${path}: ${obj.length} characters`);
            }
            else if (typeof obj === 'object' && obj !== null) {
                Object.keys(obj).forEach(key => {
                    checkForLongStrings(obj[key], path ? `${path}.${key}` : key);
                });
            }
        };
        checkForLongStrings(request.body, 'body');
        checkForLongStrings(request.query, 'query');
        if (request.body && typeof request.body === 'object') {
            const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar'];
            const checkForSuspiciousFiles = (obj) => {
                if (typeof obj === 'string') {
                    for (const ext of suspiciousExtensions) {
                        if (obj.toLowerCase().endsWith(ext)) {
                            errors.push(`Suspicious file extension detected: ${ext}`);
                            break;
                        }
                    }
                }
                else if (typeof obj === 'object' && obj !== null) {
                    Object.values(obj).forEach(checkForSuspiciousFiles);
                }
            };
            checkForSuspiciousFiles(request.body);
        }
        if (requestString.includes('\0')) {
            errors.push('Null byte detected in request');
        }
        const maxDepth = 10;
        const checkDepth = (obj, depth = 0) => {
            if (depth > maxDepth) {
                return depth;
            }
            if (typeof obj === 'object' && obj !== null) {
                let maxChildDepth = depth;
                Object.values(obj).forEach(value => {
                    const childDepth = checkDepth(value, depth + 1);
                    maxChildDepth = Math.max(maxChildDepth, childDepth);
                });
                return maxChildDepth;
            }
            return depth;
        };
        if (request.body && checkDepth(request.body) > maxDepth) {
            errors.push('Request object nesting too deep');
        }
    }
};
exports.APIValidationGuard = APIValidationGuard;
exports.APIValidationGuard = APIValidationGuard = APIValidationGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], APIValidationGuard);
const ValidateAPI = (config) => {
    return (target, propertyKey, descriptor) => {
        const setMetadata = core_1.Reflector.createDecorator();
        return setMetadata(config)(target, propertyKey, descriptor);
    };
};
exports.ValidateAPI = ValidateAPI;
const ValidateBody = (dtoClass) => (0, exports.ValidateAPI)({ body: dtoClass });
exports.ValidateBody = ValidateBody;
const ValidateQuery = (dtoClass) => (0, exports.ValidateAPI)({ query: dtoClass });
exports.ValidateQuery = ValidateQuery;
const ValidateParams = (dtoClass) => (0, exports.ValidateAPI)({ params: dtoClass });
exports.ValidateParams = ValidateParams;
const ValidateAll = (bodyClass, queryClass, paramsClass) => (0, exports.ValidateAPI)({
    body: bodyClass,
    query: queryClass,
    params: paramsClass,
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
});
exports.ValidateAll = ValidateAll;
const StrictValidation = (config = {}) => (0, exports.ValidateAPI)({
    ...config,
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    skipMissingProperties: false,
});
exports.StrictValidation = StrictValidation;
//# sourceMappingURL=api-validation.guard.js.map