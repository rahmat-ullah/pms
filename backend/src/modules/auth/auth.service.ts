import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { User, UserDocument, UserStatus } from '../../shared/database/schemas/user.schema';
import { LoginDto, RegisterDto, AuthResponseDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { AuditService } from '../../shared/audit/audit.service';
import { PasswordService } from './services/password.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly failedAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>();
  private readonly maxFailedAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private readonly attemptWindow = 15 * 60 * 1000; // 15 minutes

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
    private passwordService: PasswordService,
  ) {}

  async validateUser(email: string, password: string, ipAddress?: string): Promise<UserDocument | null> {
    // Check if account is locked due to failed attempts
    await this.checkAccountLockout(email);

    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .populate('employeeProfile')
      .exec();

    if (!user) {
      await this.recordFailedAttempt(email, ipAddress, 'User not found');
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      await this.auditService.logAuthEvent({
        userId: user._id.toString(),
        email: user.email,
        action: 'LOGIN_FAILED',
        reason: 'Account not active',
        ipAddress,
        userAgent: '',
        success: false,
      });
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      await this.recordFailedAttempt(email, ipAddress, 'Invalid password');
      return null;
    }

    // Clear failed attempts on successful login
    this.clearFailedAttempts(email);

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
    });

    // Log successful authentication
    await this.auditService.logAuthEvent({
      userId: user._id.toString(),
      email: user.email,
      action: 'LOGIN_SUCCESS',
      reason: 'Valid credentials',
      ipAddress,
      userAgent: '',
      success: true,
    });

    return user;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password, ipAddress);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
      },
    };
  }

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: registerDto.email });
    if (existingUser) {
      await this.auditService.logAuthEvent({
        userId: null,
        email: registerDto.email,
        action: 'REGISTRATION_FAILED',
        reason: 'User already exists',
        ipAddress,
        userAgent,
        success: false,
      });
      throw new ConflictException('User with this email already exists');
    }

    // Validate password complexity
    const passwordValidation = this.passwordService.validatePasswordComplexity(
      registerDto.password,
      {
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      }
    );

    if (!passwordValidation.isValid) {
      await this.auditService.logAuthEvent({
        userId: null,
        email: registerDto.email,
        action: 'REGISTRATION_FAILED',
        reason: 'Password complexity requirements not met',
        ipAddress,
        userAgent,
        success: false,
        metadata: { passwordFeedback: passwordValidation.feedback },
      });
      throw new BadRequestException({
        message: 'Password does not meet complexity requirements',
        feedback: passwordValidation.feedback,
        strength: passwordValidation.strength,
      });
    }

    // Hash password
    const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

    // Create user
    const now = new Date();
    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
      status: UserStatus.ACTIVE, // For development - in production, might be PENDING
      emailVerificationToken: crypto.randomBytes(32).toString('hex'),
      passwordChangedAt: now,
      passwordExpiresAt: this.passwordService.calculatePasswordExpiration(now),
      passwordHistory: [hashedPassword],
    });

    await user.save();

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
      },
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userModel
        .findById(payload.sub)
        .populate('employeeProfile')
        .exec();

      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Remove old refresh token
      await this.removeRefreshToken(user._id.toString(), refreshToken);

      // Generate new tokens
      const tokens = await this.generateTokens(user);
      await this.saveRefreshToken(user._id.toString(), tokens.refreshToken);

      return {
        ...tokens,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          permissions: user.permissions,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.removeRefreshToken(userId, refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      refreshTokens: [],
    });
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(userId).select('+password +passwordHistory');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordService.verifyPassword(
      user.password,
      changePasswordDto.currentPassword,
    );
    if (!isCurrentPasswordValid) {
      await this.auditService.logAuthEvent({
        userId: user._id.toString(),
        email: user.email,
        action: 'PASSWORD_CHANGE_FAILED',
        reason: 'Invalid current password',
        ipAddress: '',
        userAgent: '',
        success: false,
      });
      throw new BadRequestException('Current password is incorrect');
    }

    // Validate new password complexity
    const passwordValidation = this.passwordService.validatePasswordComplexity(
      changePasswordDto.newPassword,
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    );

    if (!passwordValidation.isValid) {
      await this.auditService.logAuthEvent({
        userId: user._id.toString(),
        email: user.email,
        action: 'PASSWORD_CHANGE_FAILED',
        reason: 'Password complexity requirements not met',
        ipAddress: '',
        userAgent: '',
        success: false,
        metadata: { passwordFeedback: passwordValidation.feedback },
      });
      throw new BadRequestException({
        message: 'Password does not meet complexity requirements',
        feedback: passwordValidation.feedback,
        strength: passwordValidation.strength,
      });
    }

    // Check password history
    const isPasswordReused = await this.passwordService.isPasswordInHistory(
      changePasswordDto.newPassword,
      user.passwordHistory || []
    );

    if (isPasswordReused) {
      await this.auditService.logAuthEvent({
        userId: user._id.toString(),
        email: user.email,
        action: 'PASSWORD_CHANGE_FAILED',
        reason: 'Password was recently used',
        ipAddress: '',
        userAgent: '',
        success: false,
      });
      throw new BadRequestException('Password was recently used. Please choose a different password.');
    }

    // Hash new password and update user
    const hashedNewPassword = await this.passwordService.hashPassword(changePasswordDto.newPassword);
    const now = new Date();
    const newPasswordHistory = this.passwordService.addToPasswordHistory(
      hashedNewPassword,
      user.passwordHistory || []
    );

    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      passwordChangedAt: now,
      passwordExpiresAt: this.passwordService.calculatePasswordExpiration(now),
      passwordHistory: newPasswordHistory,
      refreshTokens: [], // Logout from all devices
      failedLoginAttempts: 0, // Reset failed attempts
      accountLockedUntil: null, // Unlock account if locked
    });

    // Log successful password change
    await this.auditService.logAuthEvent({
      userId: user._id.toString(),
      email: user.email,
      action: 'PASSWORD_CHANGED',
      reason: 'User initiated password change',
      ipAddress: '',
      userAgent: '',
      success: true,
    });
  }

  async forgotPassword(email: string, ipAddress?: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Log the attempt but don't reveal if user exists or not
      await this.auditService.logAuthEvent({
        userId: null,
        email,
        action: 'PASSWORD_RESET_REQUESTED',
        reason: 'User not found',
        ipAddress,
        userAgent: '',
        success: false,
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userModel.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // TODO: Send email with reset token
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await argon2.hash(newPassword);
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshTokens: [], // Logout from all devices
    });
  }

  private async generateTokens(user: UserDocument): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessTokenExpiry = this.configService.get<string>('JWT_EXPIRATION', '15m');
    const refreshTokenExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessTokenExpiry,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiry,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpirationToSeconds(accessTokenExpiry),
    };
  }

  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { refreshTokens: refreshToken },
    });
  }

  private async removeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  private parseExpirationToSeconds(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900; // 15 minutes default
    }
  }

  // Security helper methods for account lockout and failed attempt tracking
  private async checkAccountLockout(email: string): Promise<void> {
    const attempts = this.failedAttempts.get(email);
    if (!attempts) return;

    const now = new Date();

    // Check if account is currently locked
    if (attempts.lockedUntil && now < attempts.lockedUntil) {
      const remainingTime = Math.ceil((attempts.lockedUntil.getTime() - now.getTime()) / 1000 / 60);
      this.logger.warn(`Account lockout check failed for ${email}. Locked for ${remainingTime} more minutes.`);

      await this.auditService.logAuthEvent({
        userId: null,
        email,
        action: 'LOGIN_BLOCKED',
        reason: `Account locked due to ${attempts.count} failed attempts`,
        ipAddress: '',
        userAgent: '',
        success: false,
      });

      throw new HttpException(`Account is locked. Try again in ${remainingTime} minutes.`, HttpStatus.TOO_MANY_REQUESTS);
    }

    // Clear expired lockout
    if (attempts.lockedUntil && now >= attempts.lockedUntil) {
      this.failedAttempts.delete(email);
    }
  }

  private async recordFailedAttempt(email: string, ipAddress?: string, reason?: string): Promise<void> {
    const now = new Date();
    const attempts = this.failedAttempts.get(email) || { count: 0, lastAttempt: now };

    // Reset count if last attempt was outside the window
    if (now.getTime() - attempts.lastAttempt.getTime() > this.attemptWindow) {
      attempts.count = 0;
    }

    attempts.count++;
    attempts.lastAttempt = now;

    // Lock account if max attempts reached
    if (attempts.count >= this.maxFailedAttempts) {
      attempts.lockedUntil = new Date(now.getTime() + this.lockoutDuration);
      this.logger.warn(`Account locked for ${email} after ${attempts.count} failed attempts`);

      await this.auditService.logAuthEvent({
        userId: null,
        email,
        action: 'ACCOUNT_LOCKED',
        reason: `${attempts.count} failed login attempts`,
        ipAddress,
        userAgent: '',
        success: false,
      });
    } else {
      await this.auditService.logAuthEvent({
        userId: null,
        email,
        action: 'LOGIN_FAILED',
        reason: reason || 'Invalid credentials',
        ipAddress,
        userAgent: '',
        success: false,
      });
    }

    this.failedAttempts.set(email, attempts);
  }

  private clearFailedAttempts(email: string): void {
    this.failedAttempts.delete(email);
  }
}
