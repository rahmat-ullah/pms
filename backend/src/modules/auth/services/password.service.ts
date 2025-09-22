import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

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
  score: number; // 0-100
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  isValid: boolean;
}

@Injectable()
export class PasswordService {
  private readonly defaultConfig: PasswordComplexityConfig = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minSpecialChars: 1,
    preventCommonPasswords: true,
    preventUserInfoInPassword: true,
  };

  private readonly commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
    'qwerty123', 'welcome123', 'admin123', 'root', 'toor', 'pass',
    'test', 'guest', 'user', 'demo', 'temp', 'temporary'
  ];

  constructor(private configService: ConfigService) {}

  /**
   * Validate password complexity according to configured rules
   */
  validatePasswordComplexity(
    password: string,
    userInfo?: { email?: string; firstName?: string; lastName?: string },
    config?: Partial<PasswordComplexityConfig>
  ): PasswordStrengthResult {
    const rules = { ...this.defaultConfig, ...config };
    const feedback: string[] = [];
    let score = 0;

    // Length validation
    if (password.length < rules.minLength) {
      feedback.push(`Password must be at least ${rules.minLength} characters long`);
    } else if (password.length >= rules.minLength) {
      score += 20;
    }

    if (password.length > rules.maxLength) {
      feedback.push(`Password cannot exceed ${rules.maxLength} characters`);
    }

    // Character type validation
    if (rules.requireUppercase && !/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      score += 15;
    }

    if (rules.requireLowercase && !/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      score += 15;
    }

    if (rules.requireNumbers && !/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      score += 15;
    }

    if (rules.requireSpecialChars) {
      const specialChars = password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
      if (!specialChars || specialChars.length < rules.minSpecialChars) {
        feedback.push(`Password must contain at least ${rules.minSpecialChars} special character(s)`);
      } else {
        score += 15;
      }
    }

    // Additional strength checks
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    if (/[A-Z].*[A-Z]/.test(password)) score += 5; // Multiple uppercase
    if (/\d.*\d/.test(password)) score += 5; // Multiple numbers
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 5; // Multiple special chars

    // Common password check
    if (rules.preventCommonPasswords) {
      const lowerPassword = password.toLowerCase();
      if (this.commonPasswords.some(common => lowerPassword.includes(common))) {
        feedback.push('Password contains common words or patterns');
        score -= 20;
      }
    }

    // User info in password check
    if (rules.preventUserInfoInPassword && userInfo) {
      const lowerPassword = password.toLowerCase();
      if (userInfo.email && lowerPassword.includes(userInfo.email.split('@')[0].toLowerCase())) {
        feedback.push('Password should not contain your email or username');
        score -= 15;
      }
      if (userInfo.firstName && lowerPassword.includes(userInfo.firstName.toLowerCase())) {
        feedback.push('Password should not contain your first name');
        score -= 10;
      }
      if (userInfo.lastName && lowerPassword.includes(userInfo.lastName.toLowerCase())) {
        feedback.push('Password should not contain your last name');
        score -= 10;
      }
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine strength level
    let strength: PasswordStrengthResult['strength'];
    if (score < 20) strength = 'very-weak';
    else if (score < 40) strength = 'weak';
    else if (score < 60) strength = 'fair';
    else if (score < 80) strength = 'good';
    else strength = 'strong';

    return {
      score,
      strength,
      feedback,
      isValid: feedback.length === 0 && score >= 60,
    };
  }

  /**
   * Hash password with Argon2
   */
  async hashPassword(password: string): Promise<string> {
    const memoryCost = this.configService.get<number>('ARGON2_MEMORY_COST', 65536); // 64 MB
    const timeCost = this.configService.get<number>('ARGON2_TIME_COST', 3);
    const parallelism = this.configService.get<number>('ARGON2_PARALLELISM', 4);

    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost,
      timeCost,
      parallelism,
    });
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if password was used recently
   */
  async isPasswordInHistory(password: string, passwordHistory: string[]): Promise<boolean> {
    if (!passwordHistory || passwordHistory.length === 0) {
      return false;
    }

    for (const historicalHash of passwordHistory) {
      if (await this.verifyPassword(historicalHash, password)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Add password to history and maintain history limit
   */
  addToPasswordHistory(currentHash: string, passwordHistory: string[] = []): string[] {
    const historyLimit = this.configService.get<number>('PASSWORD_HISTORY_LIMIT', 5);
    const newHistory = [currentHash, ...passwordHistory];
    return newHistory.slice(0, historyLimit);
  }

  /**
   * Check if password has expired
   */
  isPasswordExpired(passwordChangedAt?: Date, passwordExpiresAt?: Date): boolean {
    if (!passwordExpiresAt) {
      // If no expiration date set, check against default policy
      const maxAge = this.configService.get<number>('PASSWORD_MAX_AGE_DAYS', 90);
      if (!passwordChangedAt) return false;
      
      const expirationDate = new Date(passwordChangedAt);
      expirationDate.setDate(expirationDate.getDate() + maxAge);
      return new Date() > expirationDate;
    }

    return new Date() > passwordExpiresAt;
  }

  /**
   * Calculate password expiration date
   */
  calculatePasswordExpiration(changedAt: Date = new Date()): Date {
    const maxAge = this.configService.get<number>('PASSWORD_MAX_AGE_DAYS', 90);
    const expirationDate = new Date(changedAt);
    expirationDate.setDate(expirationDate.getDate() + maxAge);
    return expirationDate;
  }

  /**
   * Generate secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
