import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginationResult } from './base.repository';
import { User, UserDocument, UserRole, UserStatus } from '../schemas/user.schema';

export interface UserSearchOptions extends PaginationOptions {
  role?: UserRole;
  status?: UserStatus;
  searchTerm?: string;
  includeArchived?: boolean;
}

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findByRefreshToken(refreshToken: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ refreshTokens: refreshToken }).exec();
  }

  async findByPasswordResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).exec();
  }

  async findByEmailVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ emailVerificationToken: token }).exec();
  }

  async searchUsers(options: UserSearchOptions): Promise<PaginationResult<UserDocument>> {
    const {
      role,
      status,
      searchTerm,
      includeArchived = false,
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
    } = options;

    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    if (!includeArchived) {
      filter.archivedAt = { $exists: false };
    }

    if (searchTerm) {
      filter.$or = [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    return this.findWithPagination(filter, { page, limit, sort });
  }

  async findByRole(role: UserRole): Promise<UserDocument[]> {
    return this.userModel.find({ role, archivedAt: { $exists: false } }).exec();
  }

  async findByStatus(status: UserStatus): Promise<UserDocument[]> {
    return this.userModel.find({ status, archivedAt: { $exists: false } }).exec();
  }

  async findActiveUsers(): Promise<UserDocument[]> {
    return this.userModel.find({
      status: UserStatus.ACTIVE,
      archivedAt: { $exists: false },
    }).exec();
  }

  async findUsersWithEmployeeProfile(): Promise<UserDocument[]> {
    return this.userModel.find({
      employeeProfile: { $exists: true, $ne: null },
      archivedAt: { $exists: false },
    }).populate('employeeProfile').exec();
  }

  async updateLastLogin(userId: string | Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { lastLoginAt: new Date() },
      { new: true },
    ).exec();
  }

  async addRefreshToken(userId: string | Types.ObjectId, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { refreshTokens: refreshToken },
    }).exec();
  }

  async removeRefreshToken(userId: string | Types.ObjectId, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    }).exec();
  }

  async clearAllRefreshTokens(userId: string | Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      refreshTokens: [],
    }).exec();
  }

  async updatePassword(userId: string | Types.ObjectId, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      refreshTokens: [], // Clear all refresh tokens on password change
    }).exec();
  }

  async setPasswordResetToken(
    userId: string | Types.ObjectId,
    token: string,
    expires: Date,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      passwordResetToken: token,
      passwordResetExpires: expires,
    }).exec();
  }

  async clearPasswordResetToken(userId: string | Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $unset: {
        passwordResetToken: 1,
        passwordResetExpires: 1,
      },
    }).exec();
  }

  async verifyEmail(userId: string | Types.ObjectId): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      emailVerifiedAt: new Date(),
      $unset: { emailVerificationToken: 1 },
    }).exec();
  }

  async updateStatus(userId: string | Types.ObjectId, status: UserStatus): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true },
    ).exec();
  }

  async linkEmployeeProfile(
    userId: string | Types.ObjectId,
    employeeProfileId: Types.ObjectId,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { employeeProfile: employeeProfileId },
      { new: true },
    ).exec();
  }

  async unlinkEmployeeProfile(userId: string | Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $unset: { employeeProfile: 1 } },
      { new: true },
    ).exec();
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    byRole: Record<UserRole, number>;
  }> {
    const [total, active, inactive, pending, roleStats] = await Promise.all([
      this.count({ archivedAt: { $exists: false } }),
      this.count({ status: UserStatus.ACTIVE, archivedAt: { $exists: false } }),
      this.count({ status: UserStatus.INACTIVE, archivedAt: { $exists: false } }),
      this.count({ status: UserStatus.PENDING, archivedAt: { $exists: false } }),
      this.userModel.aggregate([
        { $match: { archivedAt: { $exists: false } } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]).exec(),
    ]);

    const byRole = Object.values(UserRole).reduce((acc, role) => {
      acc[role] = 0;
      return acc;
    }, {} as Record<UserRole, number>);

    roleStats.forEach(stat => {
      byRole[stat._id] = stat.count;
    });

    return {
      total,
      active,
      inactive,
      pending,
      byRole,
    };
  }

  async findRecentlyCreated(days: number = 7): Promise<UserDocument[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.userModel.find({
      createdAt: { $gte: since },
      archivedAt: { $exists: false },
    }).sort({ createdAt: -1 }).exec();
  }

  async findInactiveUsers(days: number = 30): Promise<UserDocument[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.userModel.find({
      $or: [
        { lastLoginAt: { $lt: since } },
        { lastLoginAt: { $exists: false }, createdAt: { $lt: since } },
      ],
      status: UserStatus.ACTIVE,
      archivedAt: { $exists: false },
    }).exec();
  }
}
