import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';
import { CSRFService } from './services/csrf.service';
import { PermissionsService } from './services/permissions.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, AuthResponseDto } from './dto/auth.dto';
import { UserDocument } from '../../shared/database/schemas/user.schema';
export declare class AuthController {
    private readonly authService;
    private readonly passwordService;
    private readonly sessionService;
    private readonly csrfService;
    private readonly permissionsService;
    constructor(authService: AuthService, passwordService: PasswordService, sessionService: SessionService, csrfService: CSRFService, permissionsService: PermissionsService);
    login(loginDto: LoginDto, ipAddress: string, request: Request, response: Response): Promise<AuthResponseDto>;
    register(registerDto: RegisterDto, ipAddress: string, request: Request): Promise<AuthResponseDto>;
    refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(user: UserDocument, request: Request, response: Response): Promise<{
        message: string;
    }>;
    logoutAll(user: UserDocument, response: Response): Promise<{
        message: string;
    }>;
    getProfile(user: UserDocument): {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        fullName: string;
        role: import("../../shared/database/schemas/user.schema").UserRole;
        status: import("../../shared/database/schemas/user.schema").UserStatus;
        permissions: import("../../shared/database/schemas/user.schema").UserPermissions;
        profileImage: string;
        phoneNumber: string;
        lastLoginAt: Date;
        emailVerifiedAt: Date;
        createdAt: Date;
        updatedAt: Date;
    };
    changePassword(user: UserDocument, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto, ipAddress: string): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    validatePassword(body: {
        password: string;
        userInfo?: {
            email?: string;
            firstName?: string;
            lastName?: string;
        };
    }): Promise<import("./services/password.service").PasswordStrengthResult>;
    getActiveSessions(user: UserDocument): Promise<{
        sessions: {
            sessionId: string;
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
            isActive: boolean;
        }[];
        total: number;
    }>;
    invalidateSession(user: UserDocument, request: Request): Promise<{
        message: string;
    }>;
    getCSRFToken(request: Request): Promise<{
        csrfToken: any;
        message: string;
    } | {
        csrfToken: string;
        message?: undefined;
    }>;
    getUserPermissions(user: UserDocument): Promise<{
        role: import("../../shared/database/schemas/user.schema").UserRole;
        permissions: import("./services/permissions.service").Permission[];
        roleInfo: import("./services/permissions.service").RolePermissions;
        permissionCount: number;
    }>;
    checkPermissions(user: UserDocument, body: {
        permissions: string[];
        requireAll?: boolean;
    }): Promise<{
        hasPermission: boolean;
        role: import("../../shared/database/schemas/user.schema").UserRole;
        checkedPermissions: string[];
        requireAll: boolean;
    }>;
    getAuthStatus(user: UserDocument, request: Request): Promise<{
        isAuthenticated: boolean;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../../shared/database/schemas/user.schema").UserRole;
            status: import("../../shared/database/schemas/user.schema").UserStatus;
            permissions: import("./services/permissions.service").Permission[];
        };
        session: {
            sessionId: string;
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
            lastActivity: Date;
            expiresAt: Date;
        };
        timestamp: Date;
    }>;
    refreshToken(request: Request, response: Response, ipAddress: string): Promise<{
        accessToken: string;
        expiresIn: number;
        csrfToken: any;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../../shared/database/schemas/user.schema").UserRole;
            status: string;
            permissions: any;
        };
    }>;
}
