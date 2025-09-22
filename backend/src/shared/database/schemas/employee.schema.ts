import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export type EmployeeDocument = Employee & Document;

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern',
  CONSULTANT = 'consultant',
}

export enum EmploymentStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
  RESIGNED = 'resigned',
  RETIRED = 'retired',
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  certifications?: string[];
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  technologies?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
}

@Schema({
  timestamps: true,
  collection: 'employees',
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Employee {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  employeeId: string;

  @Prop({
    required: true,
    trim: true,
  })
  department: string;

  @Prop({
    required: true,
    trim: true,
  })
  position: string;

  @Prop({
    type: String,
    enum: EmploymentType,
    required: true,
  })
  employmentType: EmploymentType;

  @Prop({
    type: String,
    enum: EmploymentStatus,
    default: EmploymentStatus.ACTIVE,
  })
  employmentStatus: EmploymentStatus;

  @Prop({
    type: Date,
    required: true,
  })
  hireDate: Date;

  @Prop({
    type: Date,
    default: null,
  })
  terminationDate?: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'Employee',
    default: null,
  })
  managerId?: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  salary: number;

  @Prop({
    type: String,
    default: 'USD',
  })
  currency: string;

  @Prop({
    type: String,
    enum: ['hourly', 'monthly', 'yearly'],
    default: 'yearly',
  })
  salaryType: string;

  @Prop({
    type: Date,
    default: null,
  })
  dateOfBirth?: Date;

  @Prop({
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: null,
  })
  gender?: string;

  @Prop({
    type: String,
    default: null,
  })
  nationality?: string;

  @Prop({
    type: Object,
    default: null,
  })
  address?: Address;

  @Prop({
    type: [Object],
    default: [],
  })
  emergencyContacts: EmergencyContact[];

  @Prop({
    type: [Object],
    default: [],
  })
  skills: Skill[];

  @Prop({
    type: [Object],
    default: [],
  })
  workExperience: WorkExperience[];

  @Prop({
    type: [Object],
    default: [],
  })
  education: Education[];

  @Prop({
    type: [String],
    default: [],
  })
  certifications: string[];

  @Prop({
    type: [String],
    default: [],
  })
  languages: string[];

  @Prop({
    type: String,
    default: null,
  })
  bio?: string;

  @Prop({
    type: String,
    default: null,
  })
  linkedinProfile?: string;

  @Prop({
    type: String,
    default: null,
  })
  githubProfile?: string;

  @Prop({
    type: Number,
    default: 40,
    min: 0,
    max: 168,
  })
  weeklyWorkingHours: number;

  @Prop({
    type: String,
    default: 'UTC',
  })
  timezone: string;

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

  // Timestamps (automatically added by Mongoose)
  createdAt: Date;
  updatedAt: Date;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Indexes for optimal query performance
EmployeeSchema.index({ userId: 1 }, { unique: true });
EmployeeSchema.index({ employeeId: 1 }, { unique: true });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ position: 1 });
EmployeeSchema.index({ employmentType: 1 });
EmployeeSchema.index({ employmentStatus: 1 });
EmployeeSchema.index({ managerId: 1 });
EmployeeSchema.index({ hireDate: -1 });
EmployeeSchema.index({ 'skills.name': 1 });
EmployeeSchema.index({ 'skills.level': 1 });

// Text search index for employee search
EmployeeSchema.index({
  'employeeId': 'text',
  'department': 'text',
  'position': 'text',
  'skills.name': 'text',
});
