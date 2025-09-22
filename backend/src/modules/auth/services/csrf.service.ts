import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface CSRFTokenInfo {
  token: string;
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
}

@Injectable()
export class CSRFService {
  private readonly logger = new Logger(CSRFService.name);
  private readonly csrfTokens = new Map<string, CSRFTokenInfo>();
  private readonly sessionTokens = new Map<string, string>(); // sessionId -> token

  constructor(private configService: ConfigService) {
    // Clean up expired tokens every 5 minutes
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 5 * 60 * 1000);
  }

  /**
   * Generate a new CSRF token for a session
   */
  generateCSRFToken(sessionId: string): string {
    // Invalidate existing token for this session
    const existingToken = this.sessionTokens.get(sessionId);
    if (existingToken) {
      this.csrfTokens.delete(existingToken);
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.getCSRFTokenTTL());

    const tokenInfo: CSRFTokenInfo = {
      token,
      sessionId,
      createdAt: now,
      expiresAt,
    };

    // Store token
    this.csrfTokens.set(token, tokenInfo);
    this.sessionTokens.set(sessionId, token);

    this.logger.debug(`CSRF token generated for session ${sessionId}`);
    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, sessionId: string): boolean {
    if (!token || !sessionId) {
      return false;
    }

    const tokenInfo = this.csrfTokens.get(token);
    if (!tokenInfo) {
      this.logger.warn(`Invalid CSRF token attempted: ${token.substring(0, 8)}...`);
      return false;
    }

    // Check if token belongs to the session
    if (tokenInfo.sessionId !== sessionId) {
      this.logger.warn(`CSRF token session mismatch: token session ${tokenInfo.sessionId}, request session ${sessionId}`);
      return false;
    }

    // Check if token is expired
    if (tokenInfo.expiresAt <= new Date()) {
      this.logger.warn(`Expired CSRF token attempted: ${token.substring(0, 8)}...`);
      this.csrfTokens.delete(token);
      this.sessionTokens.delete(sessionId);
      return false;
    }

    return true;
  }

  /**
   * Get CSRF token for a session
   */
  getCSRFToken(sessionId: string): string | undefined {
    const token = this.sessionTokens.get(sessionId);
    if (!token) return undefined;

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

  /**
   * Invalidate CSRF token for a session
   */
  invalidateCSRFToken(sessionId: string): void {
    const token = this.sessionTokens.get(sessionId);
    if (token) {
      this.csrfTokens.delete(token);
      this.sessionTokens.delete(sessionId);
      this.logger.debug(`CSRF token invalidated for session ${sessionId}`);
    }
  }

  /**
   * Refresh CSRF token (generate new one for existing session)
   */
  refreshCSRFToken(sessionId: string): string {
    this.invalidateCSRFToken(sessionId);
    return this.generateCSRFToken(sessionId);
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    const expiredTokens: string[] = [];
    const expiredSessions: string[] = [];

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

  /**
   * Get CSRF token TTL in milliseconds
   */
  private getCSRFTokenTTL(): number {
    const ttlMinutes = this.configService.get<number>('CSRF_TOKEN_TTL_MINUTES', 60); // 1 hour default
    return ttlMinutes * 60 * 1000;
  }

  /**
   * Validate CSRF token from request headers
   */
  validateCSRFFromHeaders(headers: Record<string, string | string[] | undefined>, sessionId: string): boolean {
    // Check multiple possible header names
    const csrfToken = 
      headers['x-csrf-token'] ||
      headers['x-xsrf-token'] ||
      headers['csrf-token'] ||
      headers['xsrf-token'];

    if (!csrfToken || Array.isArray(csrfToken)) {
      return false;
    }

    return this.validateCSRFToken(csrfToken, sessionId);
  }

  /**
   * Generate CSRF token for response headers
   */
  generateCSRFHeaders(sessionId: string): Record<string, string> {
    const token = this.generateCSRFToken(sessionId);
    return {
      'X-CSRF-Token': token,
      'X-XSRF-Token': token, // Alternative header name for compatibility
    };
  }
}
