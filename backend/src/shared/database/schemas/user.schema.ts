import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export type UserDocument = User & Document;

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  HR_MANAGER = 'hr_manager',
  PROJECT_MANAGER = 'project_manager',
  TEAM_LEAD = 'team_lead',
  EMPLOYEE = 'employee',
  CONTRACTOR = 'contractor',
  VIEWER = 'viewer',
  AUDITOR = 'auditor',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  ARCHIVED = 'archived',
}

export interface UserPermissions {
  canManageUsers: boolean;
  canManageEmployees: boolean;
  canManageProjects: boolean;
  canViewReports: boolean;
  canManageAttendance: boolean;
  canApproveLeave: boolean;
  canManagePayroll: boolean;
  canAccessFinance: boolean;
  canManageSettings: boolean;
}

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.refreshTokens;
      return ret;
    },
  },
})
export class User {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  })
  email: string;

  @Prop({
    required: true,
    minlength: 8,
    select: false, // Don't include in queries by default
  })
  password: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  firstName: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  lastName: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.EMPLOYEE,
    required: true,
  })
  role: UserRole;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.PENDING,
    required: true,
  })
  status: UserStatus;

  @Prop({
    type: Object,
    default: () => ({
      canManageUsers: false,
      canManageEmployees: false,
      canManageProjects: false,
      canViewReports: false,
      canManageAttendance: false,
      canApproveLeave: false,
      canManagePayroll: false,
      canAccessFinance: false,
      canManageSettings: false,
    }),
  })
  permissions: UserPermissions;

  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    default: null,
  })
  employeeProfile?: Types.ObjectId;

  @Prop({
    type: String,
    default: null,
  })
  profileImage?: string;

  @Prop({
    type: String,
    default: null,
  })
  phoneNumber?: string;

  @Prop({
    type: Date,
    default: null,
  })
  lastLoginAt?: Date;

  @Prop({
    type: Date,
    default: null,
  })
  emailVerifiedAt?: Date;

  @Prop({
    type: String,
    default: null,
    select: false,
  })
  emailVerificationToken?: string;

  @Prop({
    type: String,
    default: null,
    select: false,
  })
  passwordResetToken?: string;

  @Prop({
    type: Date,
    default: null,
    select: false,
  })
  passwordResetExpires?: Date;

  @Prop({
    type: [String],
    default: [],
    select: false,
  })
  passwordHistory?: string[];

  @Prop({
    type: Date,
    default: null,
  })
  passwordChangedAt?: Date;

  @Prop({
    type: Date,
    default: null,
  })
  passwordExpiresAt?: Date;

  @Prop({
    type: Number,
    default: 0,
  })
  failedLoginAttempts?: number;

  @Prop({
    type: Date,
    default: null,
  })
  accountLockedUntil?: Date;

  @Prop({
    type: [String],
    default: [],
    select: false,
  })
  refreshTokens: string[];

  @Prop({
    type: Object,
    default: () => ({}),
  })
  preferences: Record<string, any>;

  @Prop({
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  })
  createdBy?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  })
  updatedBy?: Types.ObjectId;

  @Prop({
    type: Date,
    default: null,
  })
  archivedAt?: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  })
  archivedBy?: Types.ObjectId;

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  // Timestamps (automatically added by Mongoose)
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for optimal query performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ employeeProfile: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLoginAt: -1 });
UserSchema.index({ 'firstName': 'text', 'lastName': 'text', 'email': 'text' });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
