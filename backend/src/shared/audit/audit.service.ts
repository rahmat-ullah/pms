import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction, AuditEntityType } from '../database/schemas/audit-log.schema';
import { AuditQueryDto, AuditResponseDto, AuditStatsResponseDto } from './dto/audit.dto';

export interface CreateAuditLogData {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async createAuditLog(data: CreateAuditLogData): Promise<AuditLogDocument> {
    const auditLog = new this.auditLogModel({
      ...data,
      entityId: new Types.ObjectId(data.entityId),
      userId: data.userId ? new Types.ObjectId(data.userId) : undefined,
      timestamp: new Date(),
      // Mask sensitive data
      oldValues: this.maskSensitiveData(data.oldValues),
      newValues: this.maskSensitiveData(data.newValues),
      changes: this.maskSensitiveData(data.changes),
    });

    return auditLog.save();
  }

  async findAll(query: AuditQueryDto): Promise<{
    auditLogs: AuditResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter = this.buildSearchFilter(query);
    const sortField = query.sortBy || 'timestamp';
    const sortDirection = query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortDirection };

    const skip = (query.page - 1) * query.limit;

    const [auditLogs, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .sort([[sortField, sortDirection]])
        .skip(skip)
        .limit(query.limit)
        .populate('userId', 'email firstName lastName')
        .exec(),
      this.auditLogModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      auditLogs: auditLogs.map(log => this.mapToResponseDto(log)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<AuditResponseDto | null> {
    const auditLog = await this.auditLogModel
      .findById(id)
      .populate('userId', 'email firstName lastName')
      .exec();

    return auditLog ? this.mapToResponseDto(auditLog) : null;
  }

  async findByEntityId(entityId: string, entityType?: AuditEntityType): Promise<AuditResponseDto[]> {
    const filter: any = { entityId: new Types.ObjectId(entityId) };
    if (entityType) {
      filter.entityType = entityType;
    }

    const auditLogs = await this.auditLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .populate('userId', 'email firstName lastName')
      .exec();

    return auditLogs.map(log => this.mapToResponseDto(log));
  }

  async findByUserId(userId: string, query: AuditQueryDto): Promise<{
    auditLogs: AuditResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter = {
      ...this.buildSearchFilter(query),
      userId: new Types.ObjectId(userId),
    };

    const sortField = query.sortBy || 'timestamp';
    const sortDirection = query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortDirection };
    const skip = (query.page - 1) * query.limit;

    const [auditLogs, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .sort([[sortField, sortDirection]])
        .skip(skip)
        .limit(query.limit)
        .populate('userId', 'email firstName lastName')
        .exec(),
      this.auditLogModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      auditLogs: auditLogs.map(log => this.mapToResponseDto(log)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  async getAuditStats(startDate?: Date, endDate?: Date): Promise<AuditStatsResponseDto> {
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = startDate;
      if (endDate) dateFilter.timestamp.$lte = endDate;
    }

    const [
      totalLogs,
      actionStats,
      entityTypeStats,
      userStats,
      dailyStats,
    ] = await Promise.all([
      this.auditLogModel.countDocuments(dateFilter),
      this.auditLogModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.auditLogModel.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$entityType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.auditLogModel.aggregate([
        { $match: { ...dateFilter, userId: { $exists: true } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            count: 1,
            userEmail: '$user.email',
            userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          },
        },
      ]),
      this.auditLogModel.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
    ]);

    return {
      totalLogs,
      actionStats: actionStats.map(stat => ({
        action: stat._id,
        count: stat.count,
      })),
      entityTypeStats: entityTypeStats.map(stat => ({
        entityType: stat._id,
        count: stat.count,
      })),
      topUsers: userStats.map(stat => ({
        userId: stat.userId.toString(),
        userEmail: stat.userEmail,
        userName: stat.userName,
        count: stat.count,
      })),
      dailyActivity: dailyStats.map(stat => ({
        date: stat._id,
        count: stat.count,
      })),
    };
  }

  async getComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    const filter = {
      timestamp: { $gte: startDate, $lte: endDate },
    };

    const [
      totalActions,
      criticalActions,
      userActions,
      entityChanges,
    ] = await Promise.all([
      this.auditLogModel.countDocuments(filter),
      this.auditLogModel.countDocuments({
        ...filter,
        action: { $in: [AuditAction.DELETE, AuditAction.ARCHIVE] },
      }),
      this.auditLogModel.aggregate([
        { $match: filter },
        { $group: { _id: '$userId', actions: { $sum: 1 } } },
        { $match: { actions: { $gte: 100 } } }, // Users with high activity
      ]),
      this.auditLogModel.aggregate([
        { $match: filter },
        { $group: { _id: '$entityType', changes: { $sum: 1 } } },
        { $sort: { changes: -1 } },
      ]),
    ]);

    return {
      reportPeriod: { startDate, endDate },
      summary: {
        totalActions,
        criticalActions,
        highActivityUsers: userActions.length,
      },
      entityChanges: entityChanges.map(change => ({
        entityType: change._id,
        changeCount: change.changes,
      })),
      highActivityUsers: userActions.map(user => ({
        userId: user._id,
        actionCount: user.actions,
      })),
    };
  }



  private buildSearchFilter(query: AuditQueryDto): any {
    const filter: any = {};

    if (query.action) {
      filter.action = query.action;
    }

    if (query.entityType) {
      filter.entityType = query.entityType;
    }

    if (query.entityId) {
      filter.entityId = new Types.ObjectId(query.entityId);
    }

    if (query.userId) {
      filter.userId = new Types.ObjectId(query.userId);
    }

    if (query.userEmail) {
      filter.userEmail = { $regex: query.userEmail, $options: 'i' };
    }

    if (query.ipAddress) {
      filter.ipAddress = query.ipAddress;
    }

    if (query.startDate || query.endDate) {
      filter.timestamp = {};
      if (query.startDate) {
        filter.timestamp.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.timestamp.$lte = new Date(query.endDate);
      }
    }

    return filter;
  }

  private maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'passwordHash',
      'refreshToken',
      'refreshTokens',
      'emailVerificationToken',
      'passwordResetToken',
      'ssn',
      'socialSecurityNumber',
      'creditCard',
      'bankAccount',
      'phoneNumber',
      'personalEmail',
      'emergencyContact',
      'salary',
      'bankDetails',
    ];

    const masked = { ...data };

    // Recursively mask nested objects
    for (const key in masked) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object' && masked[key] !== null) {
        if (Array.isArray(masked[key])) {
          masked[key] = masked[key].map((item: any) => this.maskSensitiveData(item));
        } else {
          masked[key] = this.maskSensitiveData(masked[key]);
        }
      }
    }

    return masked;
  }

  /**
   * Clean up old audit logs based on retention policy
   */
  async cleanupOldLogs(retentionDays: number = 2555): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogModel.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    this.logger.log(`Cleaned up ${result.deletedCount} audit logs older than ${retentionDays} days`);
    return { deletedCount: result.deletedCount };
  }

  /**
   * Get audit log statistics
   */
  async getAuditStatistics(): Promise<any> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      logsLast24Hours,
      logsLast7Days,
      logsLast30Days,
      actionStats,
      entityStats,
    ] = await Promise.all([
      this.auditLogModel.countDocuments(),
      this.auditLogModel.countDocuments({ timestamp: { $gte: last24Hours } }),
      this.auditLogModel.countDocuments({ timestamp: { $gte: last7Days } }),
      this.auditLogModel.countDocuments({ timestamp: { $gte: last30Days } }),
      this.auditLogModel.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.auditLogModel.aggregate([
        { $group: { _id: '$entityType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      totalLogs,
      logsLast24Hours,
      logsLast7Days,
      logsLast30Days,
      actionStats,
      entityStats,
      lastUpdated: new Date(),
    };
  }

  private mapToResponseDto(auditLog: any): AuditResponseDto {
    return {
      id: auditLog._id.toString(),
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId.toString(),
      userId: auditLog.userId?.toString(),
      userEmail: auditLog.userEmail,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      timestamp: auditLog.timestamp,
      changes: auditLog.changes,
      oldValues: auditLog.oldValues,
      newValues: auditLog.newValues,
      metadata: auditLog.metadata,
      user: auditLog.userId && typeof auditLog.userId === 'object' ? {
        id: auditLog.userId._id.toString(),
        email: auditLog.userId.email,
        firstName: auditLog.userId.firstName,
        lastName: auditLog.userId.lastName,
        fullName: `${auditLog.userId.firstName} ${auditLog.userId.lastName}`,
      } : undefined,
    };
  }

  // Authentication event logging
  async logAuthEvent(data: {
    userId?: string | null;
    email: string;
    action: string;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const auditLog = new this.auditLogModel({
        action: data.action as AuditAction,
        entityType: AuditEntityType.AUTH,
        entityId: data.userId ? new Types.ObjectId(data.userId) : new Types.ObjectId(),
        userId: data.userId ? new Types.ObjectId(data.userId) : undefined,
        userEmail: data.email,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: new Date(),
        metadata: {
          success: data.success,
          reason: data.reason,
          ...data.metadata,
        },
      });

      await auditLog.save();
    } catch (error) {
      // Log error but don't throw to avoid breaking authentication flow
      console.error('Failed to log authentication event:', error);
    }
  }
}
