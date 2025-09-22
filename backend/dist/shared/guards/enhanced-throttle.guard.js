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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressiveThrottle = exports.BurstProtection = exports.EndpointThrottle = exports.UserThrottle = exports.PublicThrottle = exports.SearchThrottle = exports.ReportThrottle = exports.AdminThrottle = exports.FileUploadThrottle = exports.APIThrottle = exports.AuthThrottle = exports.EnhancedThrottle = exports.EnhancedThrottleGuard = exports.THROTTLE_CONFIG_KEY = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
exports.THROTTLE_CONFIG_KEY = 'throttle_config';
class SimpleThrottleStorage {
    constructor() {
        this.storage = new Map();
    }
    async increment(key, ttl) {
        const now = Date.now();
        const resetTime = now + (ttl * 1000);
        const existing = this.storage.get(key);
        if (!existing || now > existing.resetTime) {
            this.storage.set(key, { count: 1, resetTime });
            return { totalHits: 1, timeToExpire: ttl };
        }
        else {
            existing.count++;
            this.storage.set(key, existing);
            const timeToExpire = Math.ceil((existing.resetTime - now) / 1000);
            return { totalHits: existing.count, timeToExpire };
        }
    }
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.storage.entries()) {
            if (now > value.resetTime) {
                this.storage.delete(key);
            }
        }
    }
}
let EnhancedThrottleGuard = class EnhancedThrottleGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.storage = new SimpleThrottleStorage();
        setInterval(() => {
            this.storage.cleanup();
        }, 5 * 60 * 1000);
    }
    async canActivate(context) {
        const throttleConfig = this.reflector.getAllAndOverride(exports.THROTTLE_CONFIG_KEY, [context.getHandler(), context.getClass()]);
        if (!throttleConfig) {
            return true;
        }
        if (throttleConfig.skipIf && throttleConfig.skipIf(context)) {
            return true;
        }
        const key = throttleConfig.keyGenerator
            ? throttleConfig.keyGenerator(context)
            : this.generateKey(context);
        const { totalHits } = await this.storage.increment(key, throttleConfig.ttl);
        if (totalHits > throttleConfig.limit) {
            throw new throttler_1.ThrottlerException(throttleConfig.message || 'Rate limit exceeded');
        }
        return true;
    }
    generateKey(context) {
        const request = context.switchToHttp().getRequest();
        const handler = context.getHandler().name;
        const className = context.getClass().name;
        const ip = this.getClientIP(request);
        const userId = request.user?.id || 'anonymous';
        return `${className}:${handler}:${ip}:${userId}`;
    }
    getClientIP(request) {
        return (request.headers['x-forwarded-for'] ||
            request.headers['x-real-ip'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.ip ||
            'unknown').split(',')[0].trim();
    }
};
exports.EnhancedThrottleGuard = EnhancedThrottleGuard;
exports.EnhancedThrottleGuard = EnhancedThrottleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], EnhancedThrottleGuard);
const EnhancedThrottle = (config) => {
    return (target, propertyKey, descriptor) => {
        const setMetadata = core_1.Reflector.createDecorator();
        return setMetadata(config)(target, propertyKey, descriptor);
    };
};
exports.EnhancedThrottle = EnhancedThrottle;
const AuthThrottle = () => (0, exports.EnhancedThrottle)({
    ttl: 60,
    limit: 5,
    message: 'Too many authentication attempts. Please try again later.',
    keyGenerator: (context) => {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip || 'unknown';
        return `auth:${ip}`;
    },
});
exports.AuthThrottle = AuthThrottle;
const APIThrottle = () => (0, exports.EnhancedThrottle)({
    ttl: 60,
    limit: 100,
    message: 'API rate limit exceeded. Please slow down.',
});
exports.APIThrottle = APIThrottle;
const FileUploadThrottle = () => (0, exports.EnhancedThrottle)({
    ttl: 300,
    limit: 10,
    message: 'File upload rate limit exceeded.',
    keyGenerator: (context) => {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id || 'anonymous';
        return `file-upload:${userId}`;
    },
});
exports.FileUploadThrottle = FileUploadThrottle;
const AdminThrottle = () => (0, exports.EnhancedThrottle)({
    ttl: 60,
    limit: 20,
    message: 'Admin operation rate limit exceeded.',
    skipIf: (context) => {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return user?.role === 'SUPER_ADMIN';
    },
});
exports.AdminThrottle = AdminThrottle;
const ReportThrottle = () => (0, exports.EnhancedThrottle)({
    ttl: 300,
    limit: 5,
    message: 'Report generation rate limit exceeded.',
    keyGenerator: (context) => {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id || 'anonymous';
        return `reports:${userId}`;
    },
});
exports.ReportThrottle = ReportThrottle;
const SearchThrottle = () => (0, exports.EnhancedThrottle)({
    ttl: 60,
    limit: 30,
    message: 'Search rate limit exceeded.',
    keyGenerator: (context) => {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id || 'anonymous';
        const ip = request.ip || 'unknown';
        return `search:${userId}:${ip}`;
    },
});
exports.SearchThrottle = SearchThrottle;
const PublicThrottle = () => (0, exports.EnhancedThrottle)({
    ttl: 60,
    limit: 50,
    message: 'Public API rate limit exceeded.',
    keyGenerator: (context) => {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip || 'unknown';
        return `public:${ip}`;
    },
});
exports.PublicThrottle = PublicThrottle;
const UserThrottle = (limit = 60, ttl = 60) => (0, exports.EnhancedThrottle)({
    ttl,
    limit,
    message: 'User rate limit exceeded.',
    keyGenerator: (context) => {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id || 'anonymous';
        return `user:${userId}`;
    },
});
exports.UserThrottle = UserThrottle;
const EndpointThrottle = (endpoint, limit = 10, ttl = 60) => (0, exports.EnhancedThrottle)({
    ttl,
    limit,
    message: `${endpoint} rate limit exceeded.`,
    keyGenerator: (context) => {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id || 'anonymous';
        const ip = request.ip || 'unknown';
        return `endpoint:${endpoint}:${userId}:${ip}`;
    },
});
exports.EndpointThrottle = EndpointThrottle;
const BurstProtection = (limit = 3, ttl = 300) => (0, exports.EnhancedThrottle)({
    ttl,
    limit,
    message: 'Burst protection activated. Please wait before retrying.',
    keyGenerator: (context) => {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id || 'anonymous';
        const handler = context.getHandler().name;
        return `burst:${handler}:${userId}`;
    },
});
exports.BurstProtection = BurstProtection;
const ProgressiveThrottle = () => (0, exports.EnhancedThrottle)({
    ttl: 60,
    limit: 10,
    message: 'Progressive rate limiting in effect.',
    keyGenerator: (context) => {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip || 'unknown';
        const userId = request.user?.id || 'anonymous';
        return `progressive:${ip}:${userId}`;
    },
});
exports.ProgressiveThrottle = ProgressiveThrottle;
//# sourceMappingURL=enhanced-throttle.guard.js.map