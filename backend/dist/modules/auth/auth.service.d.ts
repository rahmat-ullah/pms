import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '../../shared/database/schemas/user.schema';
import { LoginDto, RegisterDto, AuthResponseDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private userModel;
    private jwtService;
    private configService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<UserDocument | null>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    refreshTokens(refreshToken: string): Promise<AuthResponseDto>;
    logout(userId: string, refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    private generateTokens;
    private saveRefreshToken;
    private removeRefreshToken;
    private parseExpirationToSeconds;
}
