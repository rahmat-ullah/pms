import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export type SkillDocument = Skill & Document;
export type DepartmentDocument = Department & Document;
export type RoleDocument = Role & Document;
export type LocationDocument = Location & Document;

export enum SkillCategory {
  TECHNICAL = 'technical',
  SOFT_SKILLS = 'soft_skills',
  LANGUAGE = 'language',
  CERTIFICATION = 'certification',
  DOMAIN_KNOWLEDGE = 'domain_knowledge',
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Schema({
  timestamps: true,
  collection: 'skills',
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Skill {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
  })
  description: string;

  @Prop({
    type: String,
    enum: SkillCategory,
    required: true,
  })
  category: SkillCategory;

  @Prop({
    type: [String],
    default: [],
  })
  aliases: string[];

  @Prop({
    type: [String],
    default: [],
  })
  relatedSkills: string[];

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: Number,
    default: 0,
  })
  sortOrder: number;

  @Prop({
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

@Schema({
  timestamps: true,
  collection: 'departments',
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Department {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    trim: true,
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
  })
  description: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    default: null,
  })
  managerId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Department',
    default: null,
  })
  parentDepartmentId?: Types.ObjectId;

  @Prop({
    type: String,
    default: null,
  })
  location?: string;

  @Prop({
    type: Number,
    default: 0,
  })
  budgetAllocation: number;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: Number,
    default: 0,
  })
  sortOrder: number;

  @Prop({
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

@Schema({
  timestamps: true,
  collection: 'roles',
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Role {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  title: string;

  @Prop({
    required: true,
    trim: true,
  })
  description: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Department',
    required: true,
  })
  departmentId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive'],
    required: true,
  })
  level: string;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  minSalary: number;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  maxSalary: number;

  @Prop({
    type: [String],
    default: [],
  })
  requiredSkills: string[];

  @Prop({
    type: [String],
    default: [],
  })
  preferredSkills: string[];

  @Prop({
    type: [String],
    default: [],
  })
  responsibilities: string[];

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  minExperience: number;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: Number,
    default: 0,
  })
  sortOrder: number;

  @Prop({
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

@Schema({
  timestamps: true,
  collection: 'locations',
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Location {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    trim: true,
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
    type: String,
    enum: ['office', 'remote', 'hybrid', 'client_site'],
    required: true,
  })
  type: string;

  @Prop({
    required: true,
    trim: true,
  })
  address: string;

  @Prop({
    required: true,
    trim: true,
  })
  city: string;

  @Prop({
    required: true,
    trim: true,
  })
  country: string;

  @Prop({
    required: true,
    trim: true,
  })
  timezone: string;

  @Prop({
    type: Number,
    default: 0,
  })
  capacity: number;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: Object,
    default: () => ({}),
  })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

// Create schemas
export const SkillSchema = SchemaFactory.createForClass(Skill);
export const DepartmentSchema = SchemaFactory.createForClass(Department);
export const RoleSchema = SchemaFactory.createForClass(Role);
export const LocationSchema = SchemaFactory.createForClass(Location);

// Skill indexes
SkillSchema.index({ name: 1 }, { unique: true });
SkillSchema.index({ category: 1 });
SkillSchema.index({ isActive: 1 });
SkillSchema.index({ sortOrder: 1 });
SkillSchema.index({ 'name': 'text', 'description': 'text', 'aliases': 'text' });

// Department indexes
DepartmentSchema.index({ name: 1 }, { unique: true });
DepartmentSchema.index({ code: 1 }, { unique: true });
DepartmentSchema.index({ managerId: 1 });
DepartmentSchema.index({ parentDepartmentId: 1 });
DepartmentSchema.index({ isActive: 1 });
DepartmentSchema.index({ sortOrder: 1 });

// Role indexes
RoleSchema.index({ title: 1 }, { unique: true });
RoleSchema.index({ departmentId: 1 });
RoleSchema.index({ level: 1 });
RoleSchema.index({ isActive: 1 });
RoleSchema.index({ sortOrder: 1 });
RoleSchema.index({ requiredSkills: 1 });

// Location indexes
LocationSchema.index({ name: 1 }, { unique: true });
LocationSchema.index({ code: 1 }, { unique: true });
LocationSchema.index({ type: 1 });
LocationSchema.index({ city: 1 });
LocationSchema.index({ country: 1 });
LocationSchema.index({ isActive: 1 });
