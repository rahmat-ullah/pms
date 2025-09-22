import { BaseEntity, UserRole, EntityStatus } from './common';

export interface User extends BaseEntity {
  email: string;
  password?: string; // Only included in backend, never sent to frontend
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  passwordChangedAt?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  refreshTokens: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  types: {
    projectUpdates: boolean;
    leaveRequests: boolean;
    expenseApprovals: boolean;
    systemAlerts: boolean;
    reminders: boolean;
  };
}

export interface DashboardPreferences {
  layout: 'grid' | 'list';
  widgets: string[];
  defaultView: string;
  refreshInterval: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  preferences?: Partial<UserPreferences>;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    department: string;
    position: string;
    avatar?: string;
  };
}

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    department: string;
    position: string;
    avatar?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<UserRole, number>;
  recentLogins: number;
  lockedAccounts: number;
}
