import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../../shared/database/schemas/user.schema';
import { AuditService } from '../../../shared/audit/audit.service';
import * as crypto from 'crypto';

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

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly activeSessions = new Map<string, SessionInfo>();
  private readonly userSessions = new Map<string, Set<string>>(); // userId -> sessionIds

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  /**
   * Create a new session
   */
  async createSession(
    userId: string,
    refreshToken: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<SessionInfo> {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const deviceInfo = this.parseDeviceInfo(userAgent, ipAddress);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.getRefreshTokenTTL());

    const session: SessionInfo = {
      sessionId,
      userId,
      deviceInfo,
      createdAt: now,
      lastActivity: now,
      expiresAt,
      isActive: true,
      refreshToken,
    };

    // Check concurrent session limits
    await this.enforceConcurrentSessionLimits(userId);

    // Store session
    this.activeSessions.set(sessionId, session);
    
    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)!.add(sessionId);

    // Log session creation
    await this.auditService.logAuthEvent({
      userId,
      email: '', // Will be filled by audit service
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

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session && session.isActive) {
      session.lastActivity = new Date();
      this.activeSessions.set(sessionId, session);
    }
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): SessionInfo | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: string): SessionInfo[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];

    return Array.from(sessionIds)
      .map(id => this.activeSessions.get(id))
      .filter((session): session is SessionInfo => 
        session !== undefined && session.isActive && session.expiresAt > new Date()
      );
  }

  /**
   * Invalidate a specific session
   */
  async invalidateSession(sessionId: string, reason: string = 'User logout'): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.isActive = false;
    this.activeSessions.set(sessionId, session);

    // Remove from user sessions
    const userSessionIds = this.userSessions.get(session.userId);
    if (userSessionIds) {
      userSessionIds.delete(sessionId);
      if (userSessionIds.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }

    // Log session invalidation
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

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllUserSessions(userId: string, reason: string = 'Logout all devices'): Promise<void> {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return;

    const invalidationPromises = Array.from(sessionIds).map(sessionId =>
      this.invalidateSession(sessionId, reason)
    );

    await Promise.all(invalidationPromises);
    this.userSessions.delete(userId);

    this.logger.log(`All sessions invalidated for user ${userId}: ${reason}`);
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const expiredSessions: string[] = [];

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

  /**
   * Enforce concurrent session limits
   */
  private async enforceConcurrentSessionLimits(userId: string): Promise<void> {
    const maxConcurrentSessions = this.configService.get<number>('MAX_CONCURRENT_SESSIONS', 5);
    const userSessionIds = this.userSessions.get(userId);
    
    if (!userSessionIds || userSessionIds.size < maxConcurrentSessions) {
      return;
    }

    // Get all active sessions sorted by last activity (oldest first)
    const activeSessions = Array.from(userSessionIds)
      .map(id => this.activeSessions.get(id))
      .filter((session): session is SessionInfo => 
        session !== undefined && session.isActive && session.expiresAt > new Date()
      )
      .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime());

    // Remove oldest sessions to make room for new one
    const sessionsToRemove = activeSessions.slice(0, activeSessions.length - maxConcurrentSessions + 1);
    
    for (const session of sessionsToRemove) {
      await this.invalidateSession(session.sessionId, 'Concurrent session limit exceeded');
    }
  }

  /**
   * Parse device information from user agent
   */
  private parseDeviceInfo(userAgent: string, ipAddress: string): DeviceInfo {
    // Simple user agent parsing - in production, consider using a library like 'ua-parser-js'
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

  private detectDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  private detectBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('opera')) return 'Opera';
    return 'Unknown';
  }

  private detectOS(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    return 'Unknown';
  }

  private getRefreshTokenTTL(): number {
    const ttlString = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
    return this.parseExpirationToMilliseconds(ttlString);
  }

  private parseExpirationToMilliseconds(expiration: string): number {
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
        return 7 * 86400 * 1000; // 7 days default
    }
  }
}
