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
exports.AuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const public_decorator_1 = require("./decorators/public.decorator");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const password_service_1 = require("./services/password.service");
const session_service_1 = require("./services/session.service");
const csrf_service_1 = require("./services/csrf.service");
const permissions_service_1 = require("./services/permissions.service");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = class AuthController {
    constructor(authService, passwordService, sessionService, csrfService, permissionsService) {
        this.authService = authService;
        this.passwordService = passwordService;
        this.sessionService = sessionService;
        this.csrfService = csrfService;
        this.permissionsService = permissionsService;
    }
    async login(loginDto, ipAddress, request, response) {
        const authResult = await this.authService.login(loginDto, ipAddress, request.get('User-Agent'));
        const session = await this.sessionService.createSession(authResult.user.id, authResult.refreshToken, request.get('User-Agent') || '', ipAddress);
        response.cookie('refreshToken', authResult.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 14 * 24 * 60 * 60 * 1000,
            path: '/auth',
        });
        const csrfToken = this.csrfService.generateCSRFToken(session.sessionId);
        response.setHeader('X-CSRF-Token', csrfToken);
        return {
            ...authResult,
            refreshToken: undefined,
            sessionId: session.sessionId,
            csrfToken,
        };
    }
    async register(registerDto, ipAddress, request) {
        return this.authService.register(registerDto, ipAddress, request.get('User-Agent'));
    }
    async refreshTokens(refreshTokenDto) {
        return this.authService.refreshTokens(refreshTokenDto.refreshToken);
    }
    async logout(user, request, response) {
        const refreshToken = request.cookies?.refreshToken;
        if (refreshToken) {
            await this.authService.logout(user._id.toString(), refreshToken);
        }
        const sessionId = request.headers['x-session-id'] || request.cookies?.sessionId;
        if (sessionId) {
            await this.sessionService.invalidateSession(sessionId, 'User logout');
            this.csrfService.invalidateCSRFToken(sessionId);
        }
        response.clearCookie('refreshToken', { path: '/auth' });
        response.clearCookie('sessionId');
        return { message: 'Logout successful' };
    }
    async logoutAll(user, response) {
        await this.authService.logoutAll(user._id.toString());
        await this.sessionService.invalidateAllUserSessions(user._id.toString(), 'Logout all devices');
        response.clearCookie('refreshToken', { path: '/auth' });
        response.clearCookie('sessionId');
        return { message: 'Logout from all devices successful' };
    }
    getProfile(user) {
        return {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            status: user.status,
            permissions: user.permissions,
            profileImage: user.profileImage,
            phoneNumber: user.phoneNumber,
            lastLoginAt: user.lastLoginAt,
            emailVerifiedAt: user.emailVerifiedAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    async changePassword(user, changePasswordDto) {
        await this.authService.changePassword(user._id.toString(), changePasswordDto);
        return { message: 'Password changed successfully' };
    }
    async forgotPassword(forgotPasswordDto, ipAddress) {
        await this.authService.forgotPassword(forgotPasswordDto.email, ipAddress);
        return { message: 'Password reset email sent if user exists' };
    }
    async resetPassword(resetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
        return { message: 'Password reset successfully' };
    }
    async validatePassword(body) {
        return this.passwordService.validatePasswordComplexity(body.password, body.userInfo);
    }
    async getActiveSessions(user) {
        const sessions = this.sessionService.getUserSessions(user._id.toString());
        return {
            sessions: sessions.map(session => ({
                sessionId: session.sessionId,
                deviceInfo: session.deviceInfo,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity,
                isActive: session.isActive,
            })),
            total: sessions.length,
        };
    }
    async invalidateSession(user, request) {
        const sessionId = request.params.sessionId;
        const session = this.sessionService.getSession(sessionId);
        if (!session || session.userId !== user._id.toString()) {
            return { message: 'Session not found or unauthorized' };
        }
        await this.sessionService.invalidateSession(sessionId, 'User requested session termination');
        return { message: 'Session invalidated successfully' };
    }
    async getCSRFToken(request) {
        const sessionId = request.headers['x-session-id'] || request.cookies?.sessionId;
        if (!sessionId) {
            return { csrfToken: null, message: 'No active session' };
        }
        const csrfToken = this.csrfService.getCSRFToken(sessionId) || this.csrfService.generateCSRFToken(sessionId);
        return { csrfToken };
    }
    async getUserPermissions(user) {
        const permissions = this.permissionsService.getRolePermissions(user.role);
        const roleHierarchy = this.permissionsService.getRoleHierarchy();
        return {
            role: user.role,
            permissions,
            roleInfo: roleHierarchy.get(user.role),
            permissionCount: permissions.length,
        };
    }
    async checkPermissions(user, body) {
        const { permissions, requireAll = false } = body;
        const hasPermission = requireAll
            ? this.permissionsService.hasAllPermissions(user.role, permissions)
            : this.permissionsService.hasAnyPermission(user.role, permissions);
        return {
            hasPermission,
            role: user.role,
            checkedPermissions: permissions,
            requireAll,
        };
    }
    async getAuthStatus(user, request) {
        const sessionId = request.headers['x-session-id'] || request.cookies?.sessionId;
        const session = sessionId ? this.sessionService.getSession(sessionId) : null;
        return {
            isAuthenticated: true,
            user: {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
                permissions: this.permissionsService.getRolePermissions(user.role),
            },
            session: session ? {
                sessionId: session.sessionId,
                deviceInfo: session.deviceInfo,
                lastActivity: session.lastActivity,
                expiresAt: session.expiresAt,
            } : null,
            timestamp: new Date(),
        };
    }
    async refreshToken(request, response, ipAddress) {
        const refreshToken = request.cookies?.refreshToken;
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token not found');
        }
        try {
            const result = await this.authService.refreshTokens(refreshToken);
            const sessionId = request.headers['x-session-id'] || request.cookies?.sessionId;
            if (sessionId) {
                await this.sessionService.updateSessionActivity(sessionId);
            }
            if (result.refreshToken) {
                response.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 14 * 24 * 60 * 60 * 1000,
                    path: '/auth',
                });
            }
            let csrfToken;
            if (sessionId) {
                csrfToken = this.csrfService.refreshCSRFToken(sessionId);
                response.setHeader('X-CSRF-Token', csrfToken);
            }
            return {
                accessToken: result.accessToken,
                expiresIn: result.expiresIn,
                csrfToken,
                user: result.user,
            };
        }
        catch (error) {
            response.clearCookie('refreshToken', { path: '/auth' });
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'User login' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        type: auth_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid credentials',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too many login attempts',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: require("./dto/auth.dto").AuthResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 300000 } }),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'User registration' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Registration successful',
        type: auth_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'User already exists',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too many registration attempts',
    }),
    openapi.ApiResponse({ status: 201, type: require("./dto/auth.dto").AuthResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token refreshed successfully',
        type: auth_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid refresh token',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: require("./dto/auth.dto").AuthResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshTokens", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'User logout' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Logout successful',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('logout-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout from all devices' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Logout from all devices successful',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User profile retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Change user password' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password changed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid current password',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 300000 } }),
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password reset email sent if user exists',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too many password reset attempts',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password reset successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid or expired reset token',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('validate-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate password strength' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password strength validation result',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validatePassword", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get active sessions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Active sessions retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getActiveSessions", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/invalidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Invalidate a specific session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Session invalidated successfully',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "invalidateSession", null);
__decorate([
    (0, common_1.Get)('csrf-token'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get CSRF token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'CSRF token retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCSRFToken", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user permissions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User permissions retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Get)('permissions/check'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check specific permissions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Permission check result',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkPermissions", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get authentication status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Authentication status retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAuthStatus", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token using refresh token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token refreshed successfully',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        password_service_1.PasswordService,
        session_service_1.SessionService,
        csrf_service_1.CSRFService,
        permissions_service_1.PermissionsService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map