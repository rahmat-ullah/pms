import { Injectable, CanActivate, ExecutionContext, BadRequestException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export interface ValidationConfig {
  body?: any;
  query?: any;
  params?: any;
  skipMissingProperties?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  transform?: boolean;
}

export const VALIDATION_CONFIG_KEY = 'validation_config';

@Injectable()
export class APIValidationGuard implements CanActivate {
  private readonly logger = new Logger(APIValidationGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const validationConfig = this.reflector.getAllAndOverride<ValidationConfig>(
      VALIDATION_CONFIG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!validationConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const errors: string[] = [];

    // Validate request body
    if (validationConfig.body && request.body) {
      const bodyErrors = await this.validateObject(
        request.body,
        validationConfig.body,
        'body',
        validationConfig,
      );
      errors.push(...bodyErrors);
    }

    // Validate query parameters
    if (validationConfig.query && request.query) {
      const queryErrors = await this.validateObject(
        request.query,
        validationConfig.query,
        'query',
        validationConfig,
      );
      errors.push(...queryErrors);
    }

    // Validate route parameters
    if (validationConfig.params && request.params) {
      const paramErrors = await this.validateObject(
        request.params,
        validationConfig.params,
        'params',
        validationConfig,
      );
      errors.push(...paramErrors);
    }

    // Additional security validations
    this.performSecurityValidations(request, errors);

    if (errors.length > 0) {
      this.logger.warn(`Validation failed for ${request.method} ${request.url}: ${errors.join(', ')}`);
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }

    return true;
  }

  private async validateObject(
    obj: any,
    dtoClass: any,
    type: string,
    config: ValidationConfig,
  ): Promise<string[]> {
    try {
      const dto = plainToClass(dtoClass, obj, {
        excludeExtraneousValues: config.whitelist || false,
      });

      const validationErrors = await validate(dto, {
        skipMissingProperties: config.skipMissingProperties || false,
        whitelist: config.whitelist || false,
        forbidNonWhitelisted: config.forbidNonWhitelisted || false,
      });

      const errors: string[] = [];
      for (const error of validationErrors) {
        if (error.constraints) {
          Object.values(error.constraints).forEach(constraint => {
            errors.push(`${type}.${error.property}: ${constraint}`);
          });
        }
      }

      return errors;
    } catch (error) {
      return [`${type}: Invalid format`];
    }
  }

  private performSecurityValidations(request: Request, errors: string[]): void {
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(--|\/\*|\*\/)/g,
      /(\bUNION\b.*\bSELECT\b)/gi,
    ];

    // Check for XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
    ];

    // Check for path traversal
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

    // Check SQL injection
    for (const pattern of sqlPatterns) {
      if (pattern.test(requestString)) {
        errors.push('Potential SQL injection detected');
        break;
      }
    }

    // Check XSS
    for (const pattern of xssPatterns) {
      if (pattern.test(requestString)) {
        errors.push('Potential XSS attack detected');
        break;
      }
    }

    // Check path traversal
    for (const pattern of pathTraversalPatterns) {
      if (pattern.test(requestString)) {
        errors.push('Potential path traversal attack detected');
        break;
      }
    }

    // Check for excessively long strings (potential buffer overflow)
    const maxStringLength = 10000;
    const checkForLongStrings = (obj: any, path: string = '') => {
      if (typeof obj === 'string' && obj.length > maxStringLength) {
        errors.push(`String too long at ${path}: ${obj.length} characters`);
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          checkForLongStrings(obj[key], path ? `${path}.${key}` : key);
        });
      }
    };

    checkForLongStrings(request.body, 'body');
    checkForLongStrings(request.query, 'query');

    // Check for suspicious file extensions in uploads
    if (request.body && typeof request.body === 'object') {
      const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar'];
      const checkForSuspiciousFiles = (obj: any) => {
        if (typeof obj === 'string') {
          for (const ext of suspiciousExtensions) {
            if (obj.toLowerCase().endsWith(ext)) {
              errors.push(`Suspicious file extension detected: ${ext}`);
              break;
            }
          }
        } else if (typeof obj === 'object' && obj !== null) {
          Object.values(obj).forEach(checkForSuspiciousFiles);
        }
      };

      checkForSuspiciousFiles(request.body);
    }

    // Check for null bytes (potential for bypassing security checks)
    if (requestString.includes('\0')) {
      errors.push('Null byte detected in request');
    }

    // Check for excessive nesting (potential DoS)
    const maxDepth = 10;
    const checkDepth = (obj: any, depth: number = 0): number => {
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
}

// Decorator for API validation
export const ValidateAPI = (config: ValidationConfig) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    const setMetadata = Reflector.createDecorator<ValidationConfig>();
    return setMetadata(config)(target, propertyKey, descriptor);
  };
};

// Predefined validation decorators
export const ValidateBody = (dtoClass: any) => ValidateAPI({ body: dtoClass });
export const ValidateQuery = (dtoClass: any) => ValidateAPI({ query: dtoClass });
export const ValidateParams = (dtoClass: any) => ValidateAPI({ params: dtoClass });

export const ValidateAll = (bodyClass?: any, queryClass?: any, paramsClass?: any) => 
  ValidateAPI({
    body: bodyClass,
    query: queryClass,
    params: paramsClass,
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

// Strict validation with security checks
export const StrictValidation = (config: Partial<ValidationConfig> = {}) => 
  ValidateAPI({
    ...config,
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    skipMissingProperties: false,
  });
