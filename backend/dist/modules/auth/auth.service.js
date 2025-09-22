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
let AuthService = class AuthService {
    constructor(userModel, jwtService, configService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, password) {
        const user = await this.userModel
            .findOne({ email })
            .select('+password')
            .populate('employeeProfile')
            .exec();
        if (!user) {
            return null;
        }
        if (user.status !== user_schema_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            return null;
        }
        await this.userModel.findByIdAndUpdate(user._id, {
            lastLoginAt: new Date(),
        });
        return user;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
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
    async register(registerDto) {
        const existingUser = await this.userModel.findOne({ email: registerDto.email });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await argon2.hash(registerDto.password);
        const user = new this.userModel({
            ...registerDto,
            password: hashedPassword,
            status: user_schema_1.UserStatus.ACTIVE,
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
        const user = await this.userModel.findById(userId).select('+password');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isCurrentPasswordValid = await argon2.verify(user.password, changePasswordDto.currentPassword);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const hashedNewPassword = await argon2.hash(changePasswordDto.newPassword);
        await this.userModel.findByIdAndUpdate(userId, {
            password: hashedNewPassword,
            refreshTokens: [],
        });
    }
    async forgotPassword(email) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map