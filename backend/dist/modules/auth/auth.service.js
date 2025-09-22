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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const argon2 = require("argon2");
const crypto = require("crypto");
const user_schema_1 = require("../../shared/database/schemas/user.schema");
const audit_service_1 = require("../../shared/audit/audit.service");
const password_service_1 = require("./services/password.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(userModel, jwtService, configService, auditService, passwordService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.auditService = auditService;
        this.passwordService = passwordService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.failedAttempts = new Map();
        this.maxFailedAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000;
        this.attemptWindow = 15 * 60 * 1000;
    }
    async validateUser(email, password, ipAddress) {
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
        if (user.status !== user_schema_1.UserStatus.ACTIVE) {
            await this.auditService.logAuthEvent({
                userId: user._id.toString(),
                email: user.email,
                action: 'LOGIN_FAILED',
                reason: 'Account not active',
                ipAddress,
                userAgent: '',
                success: false,
            });
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            await this.recordFailedAttempt(email, ipAddress, 'Invalid password');
            return null;
        }
        this.clearFailedAttempts(email);
        await this.userModel.findByIdAndUpdate(user._id, {
            lastLoginAt: new Date(),
        });
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
    async login(loginDto, ipAddress, userAgent) {
        const user = await this.validateUser(loginDto.email, loginDto.password, ipAddress);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
    async register(registerDto, ipAddress, userAgent) {
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
            throw new common_1.ConflictException('User with this email already exists');
        }
        const passwordValidation = this.passwordService.validatePasswordComplexity(registerDto.password, {
            email: registerDto.email,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
        });
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
            throw new common_1.BadRequestException({
                message: 'Password does not meet complexity requirements',
                feedback: passwordValidation.feedback,
                strength: passwordValidation.strength,
            });
        }
        const hashedPassword = await this.passwordService.hashPassword(registerDto.password);
        const now = new Date();
        const user = new this.userModel({
            ...registerDto,
            password: hashedPassword,
            status: user_schema_1.UserStatus.ACTIVE,
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
    async refreshTokens(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.userModel
                .findById(payload.sub)
                .populate('employeeProfile')
                .exec();
            if (!user || !user.refreshTokens.includes(refreshToken)) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            await this.removeRefreshToken(user._id.toString(), refreshToken);
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
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId, refreshToken) {
        await this.removeRefreshToken(userId, refreshToken);
    }
    async logoutAll(userId) {
        await this.userModel.findByIdAndUpdate(userId, {
            refreshTokens: [],
        });
    }
    async changePassword(userId, changePasswordDto) {
        const user = await this.userModel.findById(userId).select('+password +passwordHistory');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isCurrentPasswordValid = await this.passwordService.verifyPassword(user.password, changePasswordDto.currentPassword);
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
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const passwordValidation = this.passwordService.validatePasswordComplexity(changePasswordDto.newPassword, {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });
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
            throw new common_1.BadRequestException({
                message: 'Password does not meet complexity requirements',
                feedback: passwordValidation.feedback,
                strength: passwordValidation.strength,
            });
        }
        const isPasswordReused = await this.passwordService.isPasswordInHistory(changePasswordDto.newPassword, user.passwordHistory || []);
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
            throw new common_1.BadRequestException('Password was recently used. Please choose a different password.');
        }
        const hashedNewPassword = await this.passwordService.hashPassword(changePasswordDto.newPassword);
        const now = new Date();
        const newPasswordHistory = this.passwordService.addToPasswordHistory(hashedNewPassword, user.passwordHistory || []);
        await this.userModel.findByIdAndUpdate(userId, {
            password: hashedNewPassword,
            passwordChangedAt: now,
            passwordExpiresAt: this.passwordService.calculatePasswordExpiration(now),
            passwordHistory: newPasswordHistory,
            refreshTokens: [],
            failedLoginAttempts: 0,
            accountLockedUntil: null,
        });
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
    async forgotPassword(email, ipAddress) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
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
        const resetExpires = new Date(Date.now() + 3600000);
        await this.userModel.findByIdAndUpdate(user._id, {
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
        });
    }
    async resetPassword(token, newPassword) {
        const user = await this.userModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const hashedPassword = await argon2.hash(newPassword);
        await this.userModel.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
            refreshTokens: [],
        });
    }
    async generateTokens(user) {
        const payload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessTokenExpiry = this.configService.get('JWT_EXPIRATION', '15m');
        const refreshTokenExpiry = this.configService.get('JWT_REFRESH_EXPIRATION', '7d');
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: accessTokenExpiry,
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: refreshTokenExpiry,
            }),
        ]);
        return {
            accessToken,
            refreshToken,
            expiresIn: this.parseExpirationToSeconds(accessTokenExpiry),
        };
    }
    async saveRefreshToken(userId, refreshToken) {
        await this.userModel.findByIdAndUpdate(userId, {
            $push: { refreshTokens: refreshToken },
        });
    }
    async removeRefreshToken(userId, refreshToken) {
        await this.userModel.findByIdAndUpdate(userId, {
            $pull: { refreshTokens: refreshToken },
        });
    }
    parseExpirationToSeconds(expiration) {
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
                return 900;
        }
    }
    async checkAccountLockout(email) {
        const attempts = this.failedAttempts.get(email);
        if (!attempts)
            return;
        const now = new Date();
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
            throw new common_1.HttpException(`Account is locked. Try again in ${remainingTime} minutes.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        if (attempts.lockedUntil && now >= attempts.lockedUntil) {
            this.failedAttempts.delete(email);
        }
    }
    async recordFailedAttempt(email, ipAddress, reason) {
        const now = new Date();
        const attempts = this.failedAttempts.get(email) || { count: 0, lastAttempt: now };
        if (now.getTime() - attempts.lastAttempt.getTime() > this.attemptWindow) {
            attempts.count = 0;
        }
        attempts.count++;
        attempts.lastAttempt = now;
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
        }
        else {
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
    clearFailedAttempts(email) {
        this.failedAttempts.delete(email);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_service_1.AuditService,
        password_service_1.PasswordService])
], AuthService);
//# sourceMappingURL=auth.service.js.map