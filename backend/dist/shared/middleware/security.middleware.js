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
var SecurityHeadersMiddleware_1, RequestValidationMiddleware_1, SecurityMonitoringMiddleware_1, CSRFProtectionMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSRFProtectionMiddleware = exports.SecurityMonitoringMiddleware = exports.RequestValidationMiddleware = exports.SecurityHeadersMiddleware = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SecurityHeadersMiddleware = SecurityHeadersMiddleware_1 = class SecurityHeadersMiddleware {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SecurityHeadersMiddleware_1.name);
    }
    use(req, res, next) {
        const cspDirectives = {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            manifestSrc: ["'self'"],
        };
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        if (this.configService.get('NODE_ENV') === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        const csp = Object.entries(cspDirectives)
            .map(([directive, sources]) => `${directive.replace(/([A-Z])/g, '-$1').toLowerCase()} ${sources.join(' ')}`)
            .join('; ');
        res.setHeader('Content-Security-Policy', csp);
        res.removeHeader('X-Powered-By');
        res.setHeader('Server', 'PMS-API');
        next();
    }
};
exports.SecurityHeadersMiddleware = SecurityHeadersMiddleware;
exports.SecurityHeadersMiddleware = SecurityHeadersMiddleware = SecurityHeadersMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SecurityHeadersMiddleware);
let RequestValidationMiddleware = RequestValidationMiddleware_1 = class RequestValidationMiddleware {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RequestValidationMiddleware_1.name);
        this.maxRequestSize = 10 * 1024 * 1024;
        this.allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
        this.suspiciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /eval\s*\(/gi,
            /expression\s*\(/gi,
            /vbscript:/gi,
            /data:text\/html/gi,
        ];
    }
    use(req, res, next) {
        try {
            if (!this.allowedMethods.includes(req.method)) {
                this.logger.warn(`Invalid HTTP method: ${req.method} from ${req.ip}`);
                return res.status(405).json({ error: 'Method Not Allowed' });
            }
            const contentLength = parseInt(req.headers['content-length'] || '0');
            if (contentLength > this.maxRequestSize) {
                this.logger.warn(`Request too large: ${contentLength} bytes from ${req.ip}`);
                return res.status(413).json({ error: 'Request Entity Too Large' });
            }
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                const contentType = req.headers['content-type'];
                if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
                    this.logger.warn(`Invalid Content-Type: ${contentType} from ${req.ip}`);
                    return res.status(415).json({ error: 'Unsupported Media Type' });
                }
            }
            const urlToCheck = req.url + JSON.stringify(req.headers);
            for (const pattern of this.suspiciousPatterns) {
                if (pattern.test(urlToCheck)) {
                    this.logger.warn(`Suspicious pattern detected in request from ${req.ip}: ${req.url}`);
                    return res.status(400).json({ error: 'Bad Request' });
                }
            }
            const userAgent = req.headers['user-agent'];
            if (!userAgent || userAgent.length < 10 || userAgent.length > 500) {
                this.logger.warn(`Suspicious User-Agent from ${req.ip}: ${userAgent}`);
            }
            const suspiciousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
            for (const header of suspiciousHeaders) {
                if (req.headers[header]) {
                    this.logger.warn(`Suspicious header detected: ${header} from ${req.ip}`);
                }
            }
            next();
        }
        catch (error) {
            this.logger.error(`Request validation error: ${error.message}`, error.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
exports.RequestValidationMiddleware = RequestValidationMiddleware;
exports.RequestValidationMiddleware = RequestValidationMiddleware = RequestValidationMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RequestValidationMiddleware);
let SecurityMonitoringMiddleware = SecurityMonitoringMiddleware_1 = class SecurityMonitoringMiddleware {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SecurityMonitoringMiddleware_1.name);
        this.suspiciousIPs = new Map();
        this.maxRequestsPerMinute = 100;
        this.blockDuration = 15 * 60 * 1000;
        setInterval(() => {
            this.cleanupSuspiciousIPs();
        }, 5 * 60 * 1000);
    }
    use(req, res, next) {
        const clientIP = this.getClientIP(req);
        const now = new Date();
        const suspiciousInfo = this.suspiciousIPs.get(clientIP);
        if (suspiciousInfo && (now.getTime() - suspiciousInfo.lastSeen.getTime()) < this.blockDuration) {
            if (suspiciousInfo.count > this.maxRequestsPerMinute) {
                this.logger.warn(`Blocked request from suspicious IP: ${clientIP}`);
                return res.status(429).json({ error: 'Too Many Requests' });
            }
        }
        this.trackRequest(clientIP, req);
        this.logSecurityEvent(req, clientIP);
        req.securityContext = {
            clientIP,
            timestamp: now,
            userAgent: req.headers['user-agent'],
            referer: req.headers.referer,
        };
        next();
    }
    getClientIP(req) {
        return (req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.ip ||
            'unknown').split(',')[0].trim();
    }
    trackRequest(ip, req) {
        const now = new Date();
        const existing = this.suspiciousIPs.get(ip);
        if (existing) {
            if (now.getTime() - existing.lastSeen.getTime() > 60000) {
                existing.count = 1;
            }
            else {
                existing.count++;
            }
            existing.lastSeen = now;
        }
        else {
            this.suspiciousIPs.set(ip, { count: 1, lastSeen: now });
        }
        const info = this.suspiciousIPs.get(ip);
        if (info.count > this.maxRequestsPerMinute) {
            this.logger.warn(`High request rate from IP ${ip}: ${info.count} requests`);
        }
    }
    logSecurityEvent(req, clientIP) {
        if (req.url.includes('/auth/')) {
            this.logger.log(`Auth request: ${req.method} ${req.url} from ${clientIP}`);
        }
        if (req.url.includes('/admin/') || req.url.includes('/system/')) {
            this.logger.log(`Admin request: ${req.method} ${req.url} from ${clientIP}`);
        }
        if (req.url.includes('/files/')) {
            this.logger.log(`File request: ${req.method} ${req.url} from ${clientIP}`);
        }
        if (req.url.includes('..') || req.url.includes('%2e%2e')) {
            this.logger.warn(`Path traversal attempt from ${clientIP}: ${req.url}`);
        }
        if (req.url.includes('<script') || req.url.includes('javascript:')) {
            this.logger.warn(`XSS attempt from ${clientIP}: ${req.url}`);
        }
        if (req.url.includes('union') || req.url.includes('select') || req.url.includes('drop')) {
            this.logger.warn(`SQL injection attempt from ${clientIP}: ${req.url}`);
        }
    }
    cleanupSuspiciousIPs() {
        const now = new Date();
        const cutoff = now.getTime() - this.blockDuration;
        for (const [ip, info] of this.suspiciousIPs.entries()) {
            if (info.lastSeen.getTime() < cutoff) {
                this.suspiciousIPs.delete(ip);
            }
        }
    }
};
exports.SecurityMonitoringMiddleware = SecurityMonitoringMiddleware;
exports.SecurityMonitoringMiddleware = SecurityMonitoringMiddleware = SecurityMonitoringMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SecurityMonitoringMiddleware);
let CSRFProtectionMiddleware = CSRFProtectionMiddleware_1 = class CSRFProtectionMiddleware {
    constructor() {
        this.logger = new common_1.Logger(CSRFProtectionMiddleware_1.name);
        this.protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        this.exemptPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/health'];
    }
    use(req, res, next) {
        if (!this.protectedMethods.includes(req.method) || this.isExemptPath(req.path)) {
            return next();
        }
        const csrfToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
        if (!csrfToken) {
            this.logger.warn(`CSRF token missing for ${req.method} ${req.path} from ${req.ip}`);
            return res.status(403).json({ error: 'CSRF token required' });
        }
        if (typeof csrfToken !== 'string' || csrfToken.length < 16) {
            this.logger.warn(`Invalid CSRF token for ${req.method} ${req.path} from ${req.ip}`);
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }
        next();
    }
    isExemptPath(path) {
        return this.exemptPaths.some(exemptPath => path.startsWith(exemptPath));
    }
};
exports.CSRFProtectionMiddleware = CSRFProtectionMiddleware;
exports.CSRFProtectionMiddleware = CSRFProtectionMiddleware = CSRFProtectionMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], CSRFProtectionMiddleware);
//# sourceMappingURL=security.middleware.js.map