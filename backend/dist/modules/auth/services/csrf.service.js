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
var CSRFService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSRFService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let CSRFService = CSRFService_1 = class CSRFService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CSRFService_1.name);
        this.csrfTokens = new Map();
        this.sessionTokens = new Map();
        setInterval(() => {
            this.cleanupExpiredTokens();
        }, 5 * 60 * 1000);
    }
    generateCSRFToken(sessionId) {
        const existingToken = this.sessionTokens.get(sessionId);
        if (existingToken) {
            this.csrfTokens.delete(existingToken);
        }
        const token = crypto.randomBytes(32).toString('hex');
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.getCSRFTokenTTL());
        const tokenInfo = {
            token,
            sessionId,
            createdAt: now,
            expiresAt,
        };
        this.csrfTokens.set(token, tokenInfo);
        this.sessionTokens.set(sessionId, token);
        this.logger.debug(`CSRF token generated for session ${sessionId}`);
        return token;
    }
    validateCSRFToken(token, sessionId) {
        if (!token || !sessionId) {
            return false;
        }
        const tokenInfo = this.csrfTokens.get(token);
        if (!tokenInfo) {
            this.logger.warn(`Invalid CSRF token attempted: ${token.substring(0, 8)}...`);
            return false;
        }
        if (tokenInfo.sessionId !== sessionId) {
            this.logger.warn(`CSRF token session mismatch: token session ${tokenInfo.sessionId}, request session ${sessionId}`);
            return false;
        }
        if (tokenInfo.expiresAt <= new Date()) {
            this.logger.warn(`Expired CSRF token attempted: ${token.substring(0, 8)}...`);
            this.csrfTokens.delete(token);
            this.sessionTokens.delete(sessionId);
            return false;
        }
        return true;
    }
    getCSRFToken(sessionId) {
        const token = this.sessionTokens.get(sessionId);
        if (!token)
            return undefined;
        const tokenInfo = this.csrfTokens.get(token);
        if (!tokenInfo || tokenInfo.expiresAt <= new Date()) {
            this.sessionTokens.delete(sessionId);
            if (tokenInfo) {
                this.csrfTokens.delete(token);
            }
            return undefined;
        }
        return token;
    }
    invalidateCSRFToken(sessionId) {
        const token = this.sessionTokens.get(sessionId);
        if (token) {
            this.csrfTokens.delete(token);
            this.sessionTokens.delete(sessionId);
            this.logger.debug(`CSRF token invalidated for session ${sessionId}`);
        }
    }
    refreshCSRFToken(sessionId) {
        this.invalidateCSRFToken(sessionId);
        return this.generateCSRFToken(sessionId);
    }
    cleanupExpiredTokens() {
        const now = new Date();
        const expiredTokens = [];
        const expiredSessions = [];
        for (const [token, tokenInfo] of this.csrfTokens.entries()) {
            if (tokenInfo.expiresAt <= now) {
                expiredTokens.push(token);
                expiredSessions.push(tokenInfo.sessionId);
            }
        }
        for (const token of expiredTokens) {
            this.csrfTokens.delete(token);
        }
        for (const sessionId of expiredSessions) {
            this.sessionTokens.delete(sessionId);
        }
        if (expiredTokens.length > 0) {
            this.logger.debug(`Cleaned up ${expiredTokens.length} expired CSRF tokens`);
        }
    }
    getCSRFTokenTTL() {
        const ttlMinutes = this.configService.get('CSRF_TOKEN_TTL_MINUTES', 60);
        return ttlMinutes * 60 * 1000;
    }
    validateCSRFFromHeaders(headers, sessionId) {
        const csrfToken = headers['x-csrf-token'] ||
            headers['x-xsrf-token'] ||
            headers['csrf-token'] ||
            headers['xsrf-token'];
        if (!csrfToken || Array.isArray(csrfToken)) {
            return false;
        }
        return this.validateCSRFToken(csrfToken, sessionId);
    }
    generateCSRFHeaders(sessionId) {
        const token = this.generateCSRFToken(sessionId);
        return {
            'X-CSRF-Token': token,
            'X-XSRF-Token': token,
        };
    }
};
exports.CSRFService = CSRFService;
exports.CSRFService = CSRFService = CSRFService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CSRFService);
//# sourceMappingURL=csrf.service.js.map