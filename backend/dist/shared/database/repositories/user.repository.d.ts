import { Model, Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginationResult } from './base.repository';
import { UserDocument, UserRole, UserStatus } from '../schemas/user.schema';
export interface UserSearchOptions extends PaginationOptions {
    role?: UserRole;
    status?: UserStatus;
    searchTerm?: string;
    includeArchived?: boolean;
}
export declare class UserRepository extends BaseRepository<UserDocument> {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findByEmail(email: string): Promise<UserDocument | null>;
    findByEmailWithPassword(email: string): Promise<UserDocument | null>;
    findByRefreshToken(refreshToken: string): Promise<UserDocument | null>;
    findByPasswordResetToken(token: string): Promise<UserDocument | null>;
    findByEmailVerificationToken(token: string): Promise<UserDocument | null>;
    searchUsers(options: UserSearchOptions): Promise<PaginationResult<UserDocument>>;
    findByRole(role: UserRole): Promise<UserDocument[]>;
    findByStatus(status: UserStatus): Promise<UserDocument[]>;
    findActiveUsers(): Promise<UserDocument[]>;
    findUsersWithEmployeeProfile(): Promise<UserDocument[]>;
    updateLastLogin(userId: string | Types.ObjectId): Promise<UserDocument | null>;
    addRefreshToken(userId: string | Types.ObjectId, refreshToken: string): Promise<void>;
    removeRefreshToken(userId: string | Types.ObjectId, refreshToken: string): Promise<void>;
    clearAllRefreshTokens(userId: string | Types.ObjectId): Promise<void>;
    updatePassword(userId: string | Types.ObjectId, hashedPassword: string): Promise<void>;
    setPasswordResetToken(userId: string | Types.ObjectId, token: string, expires: Date): Promise<void>;
    clearPasswordResetToken(userId: string | Types.ObjectId): Promise<void>;
    verifyEmail(userId: string | Types.ObjectId): Promise<void>;
    updateStatus(userId: string | Types.ObjectId, status: UserStatus): Promise<UserDocument | null>;
    linkEmployeeProfile(userId: string | Types.ObjectId, employeeProfileId: Types.ObjectId): Promise<UserDocument | null>;
    unlinkEmployeeProfile(userId: string | Types.ObjectId): Promise<UserDocument | null>;
    getUserStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        pending: number;
        byRole: Record<UserRole, number>;
    }>;
    findRecentlyCreated(days?: number): Promise<UserDocument[]>;
    findInactiveUsers(days?: number): Promise<UserDocument[]>;
}
