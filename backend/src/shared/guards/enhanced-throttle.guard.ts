import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export interface ThrottleConfig {
  ttl: number;
  limit: number;
  skipIf?: (context: ExecutionContext) => boolean;
  keyGenerator?: (context: ExecutionContext) => string;
  message?: string;
}

export const THROTTLE_CONFIG_KEY = 'throttle_config';

// Simple in-memory storage for rate limiting
class SimpleThrottleStorage {
  private storage = new Map<string, { count: number; resetTime: number }>();

  async increment(key: string, ttl: number): Promise<{ totalHits: number; timeToExpire: number }> {
    const now = Date.now();
    const resetTime = now + (ttl * 1000);

    const existing = this.storage.get(key);

    if (!existing || now > existing.resetTime) {
      // Reset or create new entry
      this.storage.set(key, { count: 1, resetTime });
      return { totalHits: 1, timeToExpire: ttl };
    } else {
      // Increment existing entry
      existing.count++;
      this.storage.set(key, existing);
      const timeToExpire = Math.ceil((existing.resetTime - now) / 1000);
      return { totalHits: existing.count, timeToExpire };
    }
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.storage.entries()) {
      if (now > value.resetTime) {
        this.storage.delete(key);
      }
    }
  }
}

@Injectable()
export class EnhancedThrottleGuard implements CanActivate {
  private readonly storage = new SimpleThrottleStorage();

  constructor(
    protected readonly reflector: Reflector,
  ) {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.storage.cleanup();
    }, 5 * 60 * 1000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const throttleConfig = this.reflector.getAllAndOverride<ThrottleConfig>(
      THROTTLE_CONFIG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!throttleConfig) {
      return true;
    }

    // Check skip condition
    if (throttleConfig.skipIf && throttleConfig.skipIf(context)) {
      return true;
    }

    const key = throttleConfig.keyGenerator
      ? throttleConfig.keyGenerator(context)
      : this.generateKey(context);

    const { totalHits } = await this.storage.increment(
      key,
      throttleConfig.ttl,
    );

    if (totalHits > throttleConfig.limit) {
      throw new ThrottlerException(
        throttleConfig.message || 'Rate limit exceeded',
      );
    }

    return true;
  }

  protected generateKey(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler().name;
    const className = context.getClass().name;
    const ip = this.getClientIP(request);
    const userId = (request as any).user?.id || 'anonymous';

    return `${className}:${handler}:${ip}:${userId}`;
  }

  private getClientIP(request: Request): string {
    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.ip ||
      'unknown'
    ).split(',')[0].trim();
  }
}

// Decorator for enhanced throttling
export const EnhancedThrottle = (config: ThrottleConfig) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    const setMetadata = Reflector.createDecorator<ThrottleConfig>();
    return setMetadata(config)(target, propertyKey, descriptor);
  };
};

// Predefined throttle configurations
export const AuthThrottle = () => EnhancedThrottle({
  ttl: 60, // 1 minute
  limit: 5,
  message: 'Too many authentication attempts. Please try again later.',
  keyGenerator: (context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || 'unknown';
    return `auth:${ip}`;
  },
});

export const APIThrottle = () => EnhancedThrottle({
  ttl: 60, // 1 minute
  limit: 100,
  message: 'API rate limit exceeded. Please slow down.',
});

export const FileUploadThrottle = () => EnhancedThrottle({
  ttl: 300, // 5 minutes
  limit: 10,
  message: 'File upload rate limit exceeded.',
  keyGenerator: (context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as any).user?.id || 'anonymous';
    return `file-upload:${userId}`;
  },
});

export const AdminThrottle = () => EnhancedThrottle({
  ttl: 60, // 1 minute
  limit: 20,
  message: 'Admin operation rate limit exceeded.',
  skipIf: (context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;
    return user?.role === 'SUPER_ADMIN';
  },
});

export const ReportThrottle = () => EnhancedThrottle({
  ttl: 300, // 5 minutes
  limit: 5,
  message: 'Report generation rate limit exceeded.',
  keyGenerator: (context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as any).user?.id || 'anonymous';
    return `reports:${userId}`;
  },
});

export const SearchThrottle = () => EnhancedThrottle({
  ttl: 60, // 1 minute
  limit: 30,
  message: 'Search rate limit exceeded.',
  keyGenerator: (context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as any).user?.id || 'anonymous';
    const ip = request.ip || 'unknown';
    return `search:${userId}:${ip}`;
  },
});

// IP-based throttling for public endpoints
export const PublicThrottle = () => EnhancedThrottle({
  ttl: 60, // 1 minute
  limit: 50,
  message: 'Public API rate limit exceeded.',
  keyGenerator: (context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || 'unknown';
    return `public:${ip}`;
  },
});

// User-specific throttling
export const UserThrottle = (limit: number = 60, ttl: number = 60) => EnhancedThrottle({
  ttl,
  limit,
  message: 'User rate limit exceeded.',
  keyGenerator: (context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as any).user?.id || 'anonymous';
    return `user:${userId}`;
  },
});

// Endpoint-specific throttling
export const EndpointThrottle = (endpoint: string, limit: number = 10, ttl: number = 60) => EnhancedThrottle({
  ttl,
  limit,
  message: `${endpoint} rate limit exceeded.`,
  keyGenerator: (context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as any).user?.id || 'anonymous';
    const ip = request.ip || 'unknown';
    return `endpoint:${endpoint}:${userId}:${ip}`;
  },
});

// Burst protection for sensitive operations
export const BurstProtection = (limit: number = 3, ttl: number = 300) => EnhancedThrottle({
  ttl,
  limit,
  message: 'Burst protection activated. Please wait before retrying.',
  keyGenerator: (context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as any).user?.id || 'anonymous';
    const handler = context.getHandler().name;
    return `burst:${handler}:${userId}`;
  },
});

// Progressive throttling (stricter limits for repeated violations)
export const ProgressiveThrottle = () => EnhancedThrottle({
  ttl: 60,
  limit: 10,
  message: 'Progressive rate limiting in effect.',
  keyGenerator: (context) => {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || 'unknown';
    const userId = (request as any).user?.id || 'anonymous';
    
    // In a real implementation, you would track violation history
    // and adjust limits accordingly
    return `progressive:${ip}:${userId}`;
  },
});
