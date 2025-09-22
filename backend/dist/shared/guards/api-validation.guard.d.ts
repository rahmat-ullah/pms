import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export interface ValidationConfig {
    body?: any;
    query?: any;
    params?: any;
    skipMissingProperties?: boolean;
    whitelist?: boolean;
    forbidNonWhitelisted?: boolean;
    transform?: boolean;
}
export declare const VALIDATION_CONFIG_KEY = "validation_config";
export declare class APIValidationGuard implements CanActivate {
    private reflector;
    private readonly logger;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private validateObject;
    private performSecurityValidations;
}
export declare const ValidateAPI: (config: ValidationConfig) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const ValidateBody: (dtoClass: any) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const ValidateQuery: (dtoClass: any) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const ValidateParams: (dtoClass: any) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const ValidateAll: (bodyClass?: any, queryClass?: any, paramsClass?: any) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const StrictValidation: (config?: Partial<ValidationConfig>) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
