import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '../../../shared/database/schemas/user.schema';
import { AuditService } from '../../../shared/audit/audit.service';
export interface SessionInfo {
    sessionId: string;
    userId: string;
    deviceInfo: {
        userAgent: string;
        deviceType: string;
        browser: string;
        os: string;
        ip: string;
        location?: {
            country?: string;
            city?: string;
            timezone?: string;
        };
    };
    createdAt: Date;
    lastActivity: Date;
    expiresAt: Date;
    isActive: boolean;
    refreshToken: string;
}
export interface DeviceInfo {
    userAgent: string;
    deviceType: string;
    browser: string;
    os: string;
    ip: string;
}
export declare class SessionService {
    private userModel;
    private configService;
    private auditService;
    private readonly logger;
    private readonly activeSessions;
    private readonly userSessions;
    constructor(userModel: Model<UserDocument>, configService: ConfigService, auditService: AuditService);
    createSession(userId: string, refreshToken: string, userAgent: string, ipAddress: string): Promise<SessionInfo>;
    updateSessionActivity(sessionId: string): Promise<void>;
    getSession(sessionId: string): SessionInfo | undefined;
    getUserSessions(userId: string): SessionInfo[];
    invalidateSession(sessionId: string, reason?: string): Promise<void>;
    invalidateAllUserSessions(userId: string, reason?: string): Promise<void>;
    cleanupExpiredSessions(): Promise<void>;
    private enforceConcurrentSessionLimits;
    private parseDeviceInfo;
    private detectDeviceType;
    private detectBrowser;
    private detectOS;
    private getRefreshTokenTTL;
    private parseExpirationToMilliseconds;
}
