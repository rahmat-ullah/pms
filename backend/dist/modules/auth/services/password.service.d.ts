import { ConfigService } from '@nestjs/config';
export interface PasswordComplexityConfig {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    minSpecialChars: number;
    preventCommonPasswords: boolean;
    preventUserInfoInPassword: boolean;
}
export interface PasswordStrengthResult {
    score: number;
    strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
    isValid: boolean;
}
export declare class PasswordService {
    private configService;
    private readonly defaultConfig;
    private readonly commonPasswords;
    constructor(configService: ConfigService);
    validatePasswordComplexity(password: string, userInfo?: {
        email?: string;
        firstName?: string;
        lastName?: string;
    }, config?: Partial<PasswordComplexityConfig>): PasswordStrengthResult;
    hashPassword(password: string): Promise<string>;
    verifyPassword(hash: string, password: string): Promise<boolean>;
    isPasswordInHistory(password: string, passwordHistory: string[]): Promise<boolean>;
    addToPasswordHistory(currentHash: string, passwordHistory?: string[]): string[];
    isPasswordExpired(passwordChangedAt?: Date, passwordExpiresAt?: Date): boolean;
    calculatePasswordExpiration(changedAt?: Date): Date;
    generateSecurePassword(length?: number): string;
}
