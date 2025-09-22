import { ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export interface ThrottleConfig {
    ttl: number;
    limit: number;
    skipIf?: (context: ExecutionContext) => boolean;
    keyGenerator?: (context: ExecutionContext) => string;
    message?: string;
}
export declare const THROTTLE_CONFIG_KEY = "throttle_config";
export declare class EnhancedThrottleGuard implements CanActivate {
    protected readonly reflector: Reflector;
    private readonly storage;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    protected generateKey(context: ExecutionContext): string;
    private getClientIP;
}
export declare const EnhancedThrottle: (config: ThrottleConfig) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const AuthThrottle: () => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const APIThrottle: () => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const FileUploadThrottle: () => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const AdminThrottle: () => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const ReportThrottle: () => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const SearchThrottle: () => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const PublicThrottle: () => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const UserThrottle: (limit?: number, ttl?: number) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const EndpointThrottle: (endpoint: string, limit?: number, ttl?: number) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const BurstProtection: (limit?: number, ttl?: number) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
export declare const ProgressiveThrottle: () => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void | TypedPropertyDescriptor<any>;
