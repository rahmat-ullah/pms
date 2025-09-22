import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
}

export enum AuditEntityType {
  USER = 'user',
  EMPLOYEE = 'employee',
  PROJECT = 'project',
  SKILL = 'skill',
  DEPARTMENT = 'department',
  ROLE = 'role',
  LOCATION = 'location',
  ATTENDANCE = 'attendance',
  LEAVE = 'leave',
  PAYROLL = 'payroll',
  FILE = 'file',
  AUTH = 'auth',
  SYSTEM = 'system',
}

export interface AuditContext {
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
}

export interface AuditChanges {
  field: string;
  oldValue: any;
  newValue: any;
  dataType: string;
}

@Schema({
  timestamps: true,
  collection: 'audit_logs',
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class AuditLog {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    type: String,
    enum: AuditAction,
    required: true,
  })
  action: AuditAction;

  @Prop({
    type: String,
    enum: AuditEntityType,
    required: true,
  })
  entityType: AuditEntityType;

  @Prop({
    type: String,
    required: true,
  })
  entityId: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  })
  userId?: Types.ObjectId;

  @Prop({
    type: String,
    default: 'system',
  })
  userEmail: string;

  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: [Object],
    default: [],
  })
  changes: AuditChanges[];

  @Prop({
    type: Object,
    default: null,
  })
  previousData?: Record<string, any>;

  @Prop({
    type: Object,
    default: null,
  })
  newData?: Record<string, any>;

  @Prop({
    type: Object,
    default: () => ({}),
  })
  context: AuditContext;

  @Prop({
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;

  @Prop({
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  })
  severity: string;

  @Prop({
    type: [String],
    default: [],
  })
  tags: string[];

  @Prop({
    type: Boolean,
    default: false,
  })
  isSystemGenerated: boolean;

  @Prop({
    type: Date,
    default: Date.now,
    index: true,
  })
  timestamp: Date;

  // Timestamps (automatically added by Mongoose)
  createdAt: Date;
  updatedAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes for optimal query performance
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entityType: 1 });
AuditLogSchema.index({ entityId: 1 });
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ userEmail: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ severity: 1 });
AuditLogSchema.index({ tags: 1 });
AuditLogSchema.index({ isSystemGenerated: 1 });

// Compound indexes for common queries
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, entityType: 1 });
AuditLogSchema.index({ timestamp: -1, severity: 1 });

// Text search index
AuditLogSchema.index({
  'description': 'text',
  'userEmail': 'text',
  'tags': 'text',
});

// TTL index for automatic cleanup (optional - can be configured)
// AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // 1 year
