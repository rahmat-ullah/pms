import { ConfigService } from '@nestjs/config';
export interface CSRFTokenInfo {
    token: string;
    sessionId: string;
    createdAt: Date;
    expiresAt: Date;
}
export declare class CSRFService {
    private configService;
    private readonly logger;
    private readonly csrfTokens;
    private readonly sessionTokens;
    constructor(configService: ConfigService);
    generateCSRFToken(sessionId: string): string;
    validateCSRFToken(token: string, sessionId: string): boolean;
    getCSRFToken(sessionId: string): string | undefined;
    invalidateCSRFToken(sessionId: string): void;
    refreshCSRFToken(sessionId: string): string;
    private cleanupExpiredTokens;
    private getCSRFTokenTTL;
    validateCSRFFromHeaders(headers: Record<string, string | string[] | undefined>, sessionId: string): boolean;
    generateCSRFHeaders(sessionId: string): Record<string, string>;
}
