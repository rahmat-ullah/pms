import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class SecurityHeadersMiddleware implements NestMiddleware {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare class RequestValidationMiddleware implements NestMiddleware {
    private configService;
    private readonly logger;
    private readonly maxRequestSize;
    private readonly allowedMethods;
    private readonly suspiciousPatterns;
    constructor(configService: ConfigService);
    use(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>>;
}
export declare class SecurityMonitoringMiddleware implements NestMiddleware {
    private configService;
    private readonly logger;
    private readonly suspiciousIPs;
    private readonly maxRequestsPerMinute;
    private readonly blockDuration;
    constructor(configService: ConfigService);
    use(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>>;
    private getClientIP;
    private trackRequest;
    private logSecurityEvent;
    private cleanupSuspiciousIPs;
}
export declare class CSRFProtectionMiddleware implements NestMiddleware {
    private readonly logger;
    private readonly protectedMethods;
    private readonly exemptPaths;
    use(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
    private isExemptPath;
}
