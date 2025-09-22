import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .populate('employeeProfile')
      .exec();

    if (!user) {
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
    });

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
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

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: registerDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await argon2.hash(registerDto.password);

    // Create user
    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
      status: UserStatus.ACTIVE, // For development - in production, might be PENDING
      emailVerificationToken: crypto.randomBytes(32).toString('hex'),
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
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await argon2.verify(
      user.password,
      changePasswordDto.currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await argon2.hash(changePasswordDto.newPassword);
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      refreshTokens: [], // Logout from all devices
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
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
}
