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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../../shared/database/schemas/user.schema");
const audit_service_1 = require("../../../shared/audit/audit.service");
const crypto = require("crypto");
let SessionService = SessionService_1 = class SessionService {
    constructor(userModel, configService, auditService) {
        this.userModel = userModel;
        this.configService = configService;
        this.auditService = auditService;
        this.logger = new common_1.Logger(SessionService_1.name);
        this.activeSessions = new Map();
        this.userSessions = new Map();
    }
    async createSession(userId, refreshToken, userAgent, ipAddress) {
        const sessionId = crypto.randomBytes(32).toString('hex');
        const deviceInfo = this.parseDeviceInfo(userAgent, ipAddress);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.getRefreshTokenTTL());
        const session = {
            sessionId,
            userId,
            deviceInfo,
            createdAt: now,
            lastActivity: now,
            expiresAt,
            isActive: true,
            refreshToken,
        };
        await this.enforceConcurrentSessionLimits(userId);
        this.activeSessions.set(sessionId, session);
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, new Set());
        }
        this.userSessions.get(userId).add(sessionId);
        await this.auditService.logAuthEvent({
            userId,
            email: '',
            action: 'SESSION_CREATED',
            reason: 'New session established',
            ipAddress,
            userAgent,
            success: true,
            metadata: {
                sessionId,
                deviceInfo,
            },
        });
        this.logger.log(`Session created for user ${userId}: ${sessionId}`);
        return session;
    }
    async updateSessionActivity(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (session && session.isActive) {
            session.lastActivity = new Date();
            this.activeSessions.set(sessionId, session);
        }
    }
    getSession(sessionId) {
        return this.activeSessions.get(sessionId);
    }
    getUserSessions(userId) {
        const sessionIds = this.userSessions.get(userId);
        if (!sessionIds)
            return [];
        return Array.from(sessionIds)
            .map(id => this.activeSessions.get(id))
            .filter((session) => session !== undefined && session.isActive && session.expiresAt > new Date());
    }
    async invalidateSession(sessionId, reason = 'User logout') {
        const session = this.activeSessions.get(sessionId);
        if (!session)
            return;
        session.isActive = false;
        this.activeSessions.set(sessionId, session);
        const userSessionIds = this.userSessions.get(session.userId);
        if (userSessionIds) {
            userSessionIds.delete(sessionId);
            if (userSessionIds.size === 0) {
                this.userSessions.delete(session.userId);
            }
        }
        await this.auditService.logAuthEvent({
            userId: session.userId,
            email: '',
            action: 'SESSION_INVALIDATED',
            reason,
            ipAddress: session.deviceInfo.ip,
            userAgent: session.deviceInfo.userAgent,
            success: true,
            metadata: {
                sessionId,
                deviceInfo: session.deviceInfo,
            },
        });
        this.logger.log(`Session invalidated: ${sessionId} - ${reason}`);
    }
    async invalidateAllUserSessions(userId, reason = 'Logout all devices') {
        const sessionIds = this.userSessions.get(userId);
        if (!sessionIds)
            return;
        const invalidationPromises = Array.from(sessionIds).map(sessionId => this.invalidateSession(sessionId, reason));
        await Promise.all(invalidationPromises);
        this.userSessions.delete(userId);
        this.logger.log(`All sessions invalidated for user ${userId}: ${reason}`);
    }
    async cleanupExpiredSessions() {
        const now = new Date();
        const expiredSessions = [];
        for (const [sessionId, session] of this.activeSessions.entries()) {
            if (session.expiresAt <= now || !session.isActive) {
                expiredSessions.push(sessionId);
            }
        }
        for (const sessionId of expiredSessions) {
            await this.invalidateSession(sessionId, 'Session expired');
            this.activeSessions.delete(sessionId);
        }
        if (expiredSessions.length > 0) {
            this.logger.log(`Cleaned up ${expiredSessions.length} expired sessions`);
        }
    }
    async enforceConcurrentSessionLimits(userId) {
        const maxConcurrentSessions = this.configService.get('MAX_CONCURRENT_SESSIONS', 5);
        const userSessionIds = this.userSessions.get(userId);
        if (!userSessionIds || userSessionIds.size < maxConcurrentSessions) {
            return;
        }
        const activeSessions = Array.from(userSessionIds)
            .map(id => this.activeSessions.get(id))
            .filter((session) => session !== undefined && session.isActive && session.expiresAt > new Date())
            .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime());
        const sessionsToRemove = activeSessions.slice(0, activeSessions.length - maxConcurrentSessions + 1);
        for (const session of sessionsToRemove) {
            await this.invalidateSession(session.sessionId, 'Concurrent session limit exceeded');
        }
    }
    parseDeviceInfo(userAgent, ipAddress) {
        const deviceType = this.detectDeviceType(userAgent);
        const browser = this.detectBrowser(userAgent);
        const os = this.detectOS(userAgent);
        return {
            userAgent,
            deviceType,
            browser,
            os,
            ip: ipAddress,
        };
    }
    detectDeviceType(userAgent) {
        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return 'mobile';
        }
        if (ua.includes('tablet') || ua.includes('ipad')) {
            return 'tablet';
        }
        return 'desktop';
    }
    detectBrowser(userAgent) {
        const ua = userAgent.toLowerCase();
        if (ua.includes('chrome'))
            return 'Chrome';
        if (ua.includes('firefox'))
            return 'Firefox';
        if (ua.includes('safari'))
            return 'Safari';
        if (ua.includes('edge'))
            return 'Edge';
        if (ua.includes('opera'))
            return 'Opera';
        return 'Unknown';
    }
    detectOS(userAgent) {
        const ua = userAgent.toLowerCase();
        if (ua.includes('windows'))
            return 'Windows';
        if (ua.includes('mac'))
            return 'macOS';
        if (ua.includes('linux'))
            return 'Linux';
        if (ua.includes('android'))
            return 'Android';
        if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad'))
            return 'iOS';
        return 'Unknown';
    }
    getRefreshTokenTTL() {
        const ttlString = this.configService.get('JWT_REFRESH_EXPIRATION', '7d');
        return this.parseExpirationToMilliseconds(ttlString);
    }
    parseExpirationToMilliseconds(expiration) {
        const unit = expiration.slice(-1);
        const value = parseInt(expiration.slice(0, -1));
        switch (unit) {
            case 's':
                return value * 1000;
            case 'm':
                return value * 60 * 1000;
            case 'h':
                return value * 3600 * 1000;
            case 'd':
                return value * 86400 * 1000;
            default:
                return 7 * 86400 * 1000;
        }
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = SessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService,
        audit_service_1.AuditService])
], SessionService);
//# sourceMappingURL=session.service.js.map