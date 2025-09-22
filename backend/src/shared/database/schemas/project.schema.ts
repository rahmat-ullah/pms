import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export type ProjectDocument = Project & Document;

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TeamMemberRole {
  PROJECT_MANAGER = 'project_manager',
  TECH_LEAD = 'tech_lead',
  SENIOR_DEVELOPER = 'senior_developer',
  DEVELOPER = 'developer',
  JUNIOR_DEVELOPER = 'junior_developer',
  QA_ENGINEER = 'qa_engineer',
  DESIGNER = 'designer',
  BUSINESS_ANALYST = 'business_analyst',
  DEVOPS_ENGINEER = 'devops_engineer',
  CONSULTANT = 'consultant',
}

export interface TeamMember {
  employeeId: Types.ObjectId;
  role: TeamMemberRole;
  allocatedHours: number; // Hours per week
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  responsibilities?: string[];
}

export interface ProjectMilestone {
  name: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  isCompleted: boolean;
  deliverables: string[];
}

export interface ProjectBudget {
  totalBudget: number;
  spentBudget: number;
  currency: string;
  budgetCategories: {
    category: string;
    allocated: number;
    spent: number;
  }[];
}

export interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  status: 'open' | 'mitigated' | 'closed';
  identifiedDate: Date;
  mitigatedDate?: Date;
}

@Schema({
  timestamps: true,
  collection: 'projects',
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Project {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    maxlength: 200,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  })
  code: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 1000,
  })
  description: string;

  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status: ProjectStatus;

  @Prop({
    type: String,
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  priority: ProjectPriority;

  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    required: true,
  })
  projectManagerId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  clientId: Types.ObjectId;

  @Prop({
    type: Date,
    required: true,
  })
  startDate: Date;

  @Prop({
    type: Date,
    required: true,
  })
  endDate: Date;

  @Prop({
    type: Date,
    default: null,
  })
  actualStartDate?: Date;

  @Prop({
    type: Date,
    default: null,
  })
  actualEndDate?: Date;

  @Prop({
    type: [Object],
    default: [],
  })
  teamMembers: TeamMember[];

  @Prop({
    type: [String],
    default: [],
  })
  technologies: string[];

  @Prop({
    type: [String],
    default: [],
  })
  tags: string[];

  @Prop({
    type: [Object],
    default: [],
  })
  milestones: ProjectMilestone[];

  @Prop({
    type: Object,
    default: null,
  })
  budget?: ProjectBudget;

  @Prop({
    type: [Object],
    default: [],
  })
  risks: ProjectRisk[];

  @Prop({
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  })
  progressPercentage: number;

  @Prop({
    type: Number,
    default: 0,
  })
  estimatedHours: number;

  @Prop({
    type: Number,
    default: 0,
  })
  actualHours: number;

  @Prop({
    type: String,
    default: null,
  })
  repositoryUrl?: string;

  @Prop({
    type: String,
    default: null,
  })
  documentationUrl?: string;

  @Prop({
    type: String,
    default: null,
  })
  deploymentUrl?: string;

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
  get isActive(): boolean {
    return this.status === ProjectStatus.ACTIVE;
  }

  get isOverdue(): boolean {
    return new Date() > this.endDate && this.status !== ProjectStatus.COMPLETED;
  }

  get totalTeamMembers(): number {
    return this.teamMembers.filter(member => member.isActive).length;
  }

  get totalAllocatedHours(): number {
    return this.teamMembers
      .filter(member => member.isActive)
      .reduce((total, member) => total + member.allocatedHours, 0);
  }

  // Timestamps (automatically added by Mongoose)
  createdAt: Date;
  updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Indexes for optimal query performance
ProjectSchema.index({ code: 1 }, { unique: true });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ priority: 1 });
ProjectSchema.index({ projectManagerId: 1 });
ProjectSchema.index({ clientId: 1 });
ProjectSchema.index({ startDate: 1 });
ProjectSchema.index({ endDate: 1 });
ProjectSchema.index({ 'teamMembers.employeeId': 1 });
ProjectSchema.index({ technologies: 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ createdAt: -1 });

// Text search index for project search
ProjectSchema.index({
  'name': 'text',
  'code': 'text',
  'description': 'text',
  'technologies': 'text',
  'tags': 'text',
});

// Compound indexes for common queries
ProjectSchema.index({ status: 1, priority: 1 });
ProjectSchema.index({ projectManagerId: 1, status: 1 });

// Virtual fields
ProjectSchema.virtual('isActive').get(function() {
  return this.status === ProjectStatus.ACTIVE;
});

ProjectSchema.virtual('isOverdue').get(function() {
  return new Date() > this.endDate && this.status !== ProjectStatus.COMPLETED;
});

// Ensure virtual fields are serialized
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });
