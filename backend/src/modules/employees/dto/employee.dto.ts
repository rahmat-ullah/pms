import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsDateString, 
  IsNumber, 
  IsArray, 
  IsObject, 
  IsEmail, 
  IsPhoneNumber,
  Min,
  Max,
  ValidateNested,
  IsBoolean
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';
import { 
  EmploymentType, 
  EmploymentStatus,
  Address,
  EmergencyContact,
  Skill,
  WorkExperience,
  Education
} from '../../../shared/database/schemas/employee.schema';

export class CreateEmployeeDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'EMP001' })
  @IsString()
  employeeId: string;

  @ApiProperty({ example: 'Engineering' })
  @IsString()
  department: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  position: string;

  @ApiProperty({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiPropertyOptional({ enum: EmploymentStatus })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @ApiProperty({ example: '2023-01-15T00:00:00.000Z' })
  @IsDateString()
  hireDate: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiProperty({ example: 75000 })
  @IsNumber()
  @Min(0)
  salary: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'yearly' })
  @IsOptional()
  @IsEnum(['hourly', 'monthly', 'yearly'])
  salaryType?: string;

  @ApiPropertyOptional({ example: '1990-05-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'male' })
  @IsOptional()
  @IsEnum(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;

  @ApiPropertyOptional({ example: 'American' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  address?: Address;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  emergencyContacts?: EmergencyContact[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  skills?: Skill[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  workExperience?: WorkExperience[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  education?: Education[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ example: 'Experienced software engineer with expertise in full-stack development.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/johndoe' })
  @IsOptional()
  @IsString()
  linkedinProfile?: string;

  @ApiPropertyOptional({ example: 'https://github.com/johndoe' })
  @IsOptional()
  @IsString()
  githubProfile?: string;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(80)
  weeklyWorkingHours?: number;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiPropertyOptional({ example: '2023-12-31T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  terminationDate?: string;
}

export class EmployeeQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'Senior Software Engineer' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ enum: EmploymentStatus })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ example: 'hireDate' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'hireDate';

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeTerminated?: boolean = false;
}

export class EmployeeResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  userId: string;

  @ApiProperty({ example: 'EMP001' })
  employeeId: string;

  @ApiProperty({ example: 'Engineering' })
  department: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  position: string;

  @ApiProperty({ enum: EmploymentType })
  employmentType: EmploymentType;

  @ApiProperty({ enum: EmploymentStatus })
  employmentStatus: EmploymentStatus;

  @ApiProperty({ example: '2023-01-15T00:00:00.000Z' })
  hireDate: Date;

  @ApiPropertyOptional({ example: '2023-12-31T00:00:00.000Z' })
  terminationDate?: Date;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  managerId?: string;

  @ApiProperty({ example: 75000 })
  salary: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: 'yearly' })
  salaryType: string;

  @ApiPropertyOptional({ example: '1990-05-15T00:00:00.000Z' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'male' })
  gender?: string;

  @ApiPropertyOptional({ example: 'American' })
  nationality?: string;

  @ApiPropertyOptional()
  address?: Address;

  @ApiPropertyOptional({ type: [Object] })
  emergencyContacts?: EmergencyContact[];

  @ApiPropertyOptional({ type: [Object] })
  skills?: Skill[];

  @ApiPropertyOptional({ type: [Object] })
  workExperience?: WorkExperience[];

  @ApiPropertyOptional({ type: [Object] })
  education?: Education[];

  @ApiPropertyOptional({ type: [String] })
  certifications?: string[];

  @ApiPropertyOptional({ type: [String] })
  languages?: string[];

  @ApiPropertyOptional({ example: 'Experienced software engineer...' })
  bio?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/johndoe' })
  linkedinProfile?: string;

  @ApiPropertyOptional({ example: 'https://github.com/johndoe' })
  githubProfile?: string;

  @ApiProperty({ example: 40 })
  weeklyWorkingHours: number;

  @ApiProperty({ example: 'America/New_York' })
  timezone: string;

  @ApiPropertyOptional()
  preferences?: Record<string, any>;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  createdBy?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  updatedBy?: string;

  @ApiProperty({ example: '2023-01-15T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-15T00:00:00.000Z' })
  updatedAt: Date;

  // Populated user information
  @ApiPropertyOptional()
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    profileImage?: string;
  };

  // Populated manager information
  @ApiPropertyOptional()
  manager?: {
    id: string;
    employeeId: string;
    user: {
      firstName: string;
      lastName: string;
      fullName: string;
    };
  };
}
