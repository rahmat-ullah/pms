import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityHeadersMiddleware.name);

  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Content Security Policy
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

    // Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // HSTS (HTTP Strict Transport Security)
    if (this.configService.get('NODE_ENV') === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Content Security Policy
    const csp = Object.entries(cspDirectives)
      .map(([directive, sources]) => `${directive.replace(/([A-Z])/g, '-$1').toLowerCase()} ${sources.join(' ')}`)
      .join('; ');
    res.setHeader('Content-Security-Policy', csp);

    // Remove server information
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'PMS-API');

    next();
  }
}

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestValidationMiddleware.name);
  private readonly maxRequestSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
  private readonly suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];

  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate HTTP method
      if (!this.allowedMethods.includes(req.method)) {
        this.logger.warn(`Invalid HTTP method: ${req.method} from ${req.ip}`);
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      // Check request size
      const contentLength = parseInt(req.headers['content-length'] || '0');
      if (contentLength > this.maxRequestSize) {
        this.logger.warn(`Request too large: ${contentLength} bytes from ${req.ip}`);
        return res.status(413).json({ error: 'Request Entity Too Large' });
      }

      // Validate Content-Type for POST/PUT/PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];
        if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
          this.logger.warn(`Invalid Content-Type: ${contentType} from ${req.ip}`);
          return res.status(415).json({ error: 'Unsupported Media Type' });
        }
      }

      // Check for suspicious patterns in URL and headers
      const urlToCheck = req.url + JSON.stringify(req.headers);
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(urlToCheck)) {
          this.logger.warn(`Suspicious pattern detected in request from ${req.ip}: ${req.url}`);
          return res.status(400).json({ error: 'Bad Request' });
        }
      }

      // Validate User-Agent
      const userAgent = req.headers['user-agent'];
      if (!userAgent || userAgent.length < 10 || userAgent.length > 500) {
        this.logger.warn(`Suspicious User-Agent from ${req.ip}: ${userAgent}`);
        // Don't block, but log for monitoring
      }

      // Check for common attack headers
      const suspiciousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
      for (const header of suspiciousHeaders) {
        if (req.headers[header]) {
          this.logger.warn(`Suspicious header detected: ${header} from ${req.ip}`);
        }
      }

      next();
    } catch (error) {
      this.logger.error(`Request validation error: ${error.message}`, error.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

@Injectable()
export class SecurityMonitoringMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMonitoringMiddleware.name);
  private readonly suspiciousIPs = new Map<string, { count: number; lastSeen: Date }>();
  private readonly maxRequestsPerMinute = 100;
  private readonly blockDuration = 15 * 60 * 1000; // 15 minutes

  constructor(private configService: ConfigService) {
    // Clean up suspicious IPs every 5 minutes
    setInterval(() => {
      this.cleanupSuspiciousIPs();
    }, 5 * 60 * 1000);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const clientIP = this.getClientIP(req);
    const now = new Date();

    // Check if IP is currently blocked
    const suspiciousInfo = this.suspiciousIPs.get(clientIP);
    if (suspiciousInfo && (now.getTime() - suspiciousInfo.lastSeen.getTime()) < this.blockDuration) {
      if (suspiciousInfo.count > this.maxRequestsPerMinute) {
        this.logger.warn(`Blocked request from suspicious IP: ${clientIP}`);
        return res.status(429).json({ error: 'Too Many Requests' });
      }
    }

    // Track request
    this.trackRequest(clientIP, req);

    // Log security-relevant events
    this.logSecurityEvent(req, clientIP);

    // Add security context to request
    (req as any).securityContext = {
      clientIP,
      timestamp: now,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer,
    };

    next();
  }

  private getClientIP(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown'
    ).split(',')[0].trim();
  }

  private trackRequest(ip: string, req: Request): void {
    const now = new Date();
    const existing = this.suspiciousIPs.get(ip);

    if (existing) {
      // Reset count if more than a minute has passed
      if (now.getTime() - existing.lastSeen.getTime() > 60000) {
        existing.count = 1;
      } else {
        existing.count++;
      }
      existing.lastSeen = now;
    } else {
      this.suspiciousIPs.set(ip, { count: 1, lastSeen: now });
    }

    // Log if suspicious activity detected
    const info = this.suspiciousIPs.get(ip)!;
    if (info.count > this.maxRequestsPerMinute) {
      this.logger.warn(`High request rate from IP ${ip}: ${info.count} requests`);
    }
  }

  private logSecurityEvent(req: Request, clientIP: string): void {
    // Log authentication attempts
    if (req.url.includes('/auth/')) {
      this.logger.log(`Auth request: ${req.method} ${req.url} from ${clientIP}`);
    }

    // Log admin endpoints
    if (req.url.includes('/admin/') || req.url.includes('/system/')) {
      this.logger.log(`Admin request: ${req.method} ${req.url} from ${clientIP}`);
    }

    // Log file operations
    if (req.url.includes('/files/')) {
      this.logger.log(`File request: ${req.method} ${req.url} from ${clientIP}`);
    }

    // Log suspicious patterns
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

  private cleanupSuspiciousIPs(): void {
    const now = new Date();
    const cutoff = now.getTime() - this.blockDuration;

    for (const [ip, info] of this.suspiciousIPs.entries()) {
      if (info.lastSeen.getTime() < cutoff) {
        this.suspiciousIPs.delete(ip);
      }
    }
  }
}

@Injectable()
export class CSRFProtectionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CSRFProtectionMiddleware.name);
  private readonly protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  private readonly exemptPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/health'];

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF protection for exempt paths and safe methods
    if (!this.protectedMethods.includes(req.method) || this.isExemptPath(req.path)) {
      return next();
    }

    // Check for CSRF token in headers
    const csrfToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
    
    if (!csrfToken) {
      this.logger.warn(`CSRF token missing for ${req.method} ${req.path} from ${req.ip}`);
      return res.status(403).json({ error: 'CSRF token required' });
    }

    // In a real implementation, you would validate the token against the session
    // For now, we'll just check that it exists and has a reasonable format
    if (typeof csrfToken !== 'string' || csrfToken.length < 16) {
      this.logger.warn(`Invalid CSRF token for ${req.method} ${req.path} from ${req.ip}`);
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
  }

  private isExemptPath(path: string): boolean {
    return this.exemptPaths.some(exemptPath => path.startsWith(exemptPath));
  }
}
