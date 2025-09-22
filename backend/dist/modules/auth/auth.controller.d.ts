import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, AuthResponseDto } from './dto/auth.dto';
import { UserDocument } from '../../shared/database/schemas/user.schema';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(user: UserDocument, refreshTokenDto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    logoutAll(user: UserDocument): Promise<{
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
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
