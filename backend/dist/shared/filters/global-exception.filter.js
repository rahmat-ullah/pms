"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        let details = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object') {
                message = exceptionResponse.message || exception.message;
                error = exceptionResponse.error || error;
                details = exceptionResponse.details || null;
            }
        }
        else if (exception instanceof mongodb_1.MongoError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            if (exception.code === 11000) {
                const field = Object.keys(exception.keyPattern)[0];
                message = `${field} already exists`;
                error = 'Duplicate Entry';
            }
            else {
                message = 'Database operation failed';
                error = 'Database Error';
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
        }
        const errorLog = {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            statusCode: status,
            message,
            error,
            userAgent: request.get('User-Agent'),
            ip: request.ip,
            ...(details && { details }),
        };
        if (status >= 500) {
            this.logger.error('Server Error:', errorLog);
        }
        else {
            this.logger.warn('Client Error:', errorLog);
        }
        const errorResponse = {
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            error,
            ...(details && { details }),
            ...(process.env.NODE_ENV === 'development' && {
                stack: exception instanceof Error ? exception.stack : undefined,
            }),
        };
        response.status(status).json(errorResponse);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map