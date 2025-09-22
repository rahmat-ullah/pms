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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const argon2 = require("argon2");
let PasswordService = class PasswordService {
    constructor(configService) {
        this.configService = configService;
        this.defaultConfig = {
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
        this.commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
            'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
            'qwerty123', 'welcome123', 'admin123', 'root', 'toor', 'pass',
            'test', 'guest', 'user', 'demo', 'temp', 'temporary'
        ];
    }
    validatePasswordComplexity(password, userInfo, config) {
        const rules = { ...this.defaultConfig, ...config };
        const feedback = [];
        let score = 0;
        if (password.length < rules.minLength) {
            feedback.push(`Password must be at least ${rules.minLength} characters long`);
        }
        else if (password.length >= rules.minLength) {
            score += 20;
        }
        if (password.length > rules.maxLength) {
            feedback.push(`Password cannot exceed ${rules.maxLength} characters`);
        }
        if (rules.requireUppercase && !/[A-Z]/.test(password)) {
            feedback.push('Password must contain at least one uppercase letter');
        }
        else if (/[A-Z]/.test(password)) {
            score += 15;
        }
        if (rules.requireLowercase && !/[a-z]/.test(password)) {
            feedback.push('Password must contain at least one lowercase letter');
        }
        else if (/[a-z]/.test(password)) {
            score += 15;
        }
        if (rules.requireNumbers && !/\d/.test(password)) {
            feedback.push('Password must contain at least one number');
        }
        else if (/\d/.test(password)) {
            score += 15;
        }
        if (rules.requireSpecialChars) {
            const specialChars = password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
            if (!specialChars || specialChars.length < rules.minSpecialChars) {
                feedback.push(`Password must contain at least ${rules.minSpecialChars} special character(s)`);
            }
            else {
                score += 15;
            }
        }
        if (password.length >= 12)
            score += 10;
        if (password.length >= 16)
            score += 10;
        if (/[A-Z].*[A-Z]/.test(password))
            score += 5;
        if (/\d.*\d/.test(password))
            score += 5;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
            score += 5;
        if (rules.preventCommonPasswords) {
            const lowerPassword = password.toLowerCase();
            if (this.commonPasswords.some(common => lowerPassword.includes(common))) {
                feedback.push('Password contains common words or patterns');
                score -= 20;
            }
        }
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
        score = Math.max(0, Math.min(100, score));
        let strength;
        if (score < 20)
            strength = 'very-weak';
        else if (score < 40)
            strength = 'weak';
        else if (score < 60)
            strength = 'fair';
        else if (score < 80)
            strength = 'good';
        else
            strength = 'strong';
        return {
            score,
            strength,
            feedback,
            isValid: feedback.length === 0 && score >= 60,
        };
    }
    async hashPassword(password) {
        const memoryCost = this.configService.get('ARGON2_MEMORY_COST', 65536);
        const timeCost = this.configService.get('ARGON2_TIME_COST', 3);
        const parallelism = this.configService.get('ARGON2_PARALLELISM', 4);
        return argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost,
            timeCost,
            parallelism,
        });
    }
    async verifyPassword(hash, password) {
        try {
            return await argon2.verify(hash, password);
        }
        catch (error) {
            return false;
        }
    }
    async isPasswordInHistory(password, passwordHistory) {
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
    addToPasswordHistory(currentHash, passwordHistory = []) {
        const historyLimit = this.configService.get('PASSWORD_HISTORY_LIMIT', 5);
        const newHistory = [currentHash, ...passwordHistory];
        return newHistory.slice(0, historyLimit);
    }
    isPasswordExpired(passwordChangedAt, passwordExpiresAt) {
        if (!passwordExpiresAt) {
            const maxAge = this.configService.get('PASSWORD_MAX_AGE_DAYS', 90);
            if (!passwordChangedAt)
                return false;
            const expirationDate = new Date(passwordChangedAt);
            expirationDate.setDate(expirationDate.getDate() + maxAge);
            return new Date() > expirationDate;
        }
        return new Date() > passwordExpiresAt;
    }
    calculatePasswordExpiration(changedAt = new Date()) {
        const maxAge = this.configService.get('PASSWORD_MAX_AGE_DAYS', 90);
        const expirationDate = new Date(changedAt);
        expirationDate.setDate(expirationDate.getDate() + maxAge);
        return expirationDate;
    }
    generateSecurePassword(length = 16) {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const allChars = uppercase + lowercase + numbers + symbols;
        let password = '';
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        for (let i = 4; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
};
exports.PasswordService = PasswordService;
exports.PasswordService = PasswordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PasswordService);
//# sourceMappingURL=password.service.js.map