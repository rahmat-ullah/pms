import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsObject, IsArray, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { AuditAction, AuditEntityType } from '../../database/schemas/audit-log.schema';

export class AuditQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiPropertyOptional({ enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ enum: AuditEntityType })
  @IsOptional()
  @IsEnum(AuditEntityType)
  entityType?: AuditEntityType;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2023-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'user' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'timestamp' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class AuditLogDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  userId: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  userEmail: string;

  @ApiProperty({ enum: AuditAction })
  action: AuditAction;

  @ApiProperty({ enum: AuditEntityType })
  entityType: AuditEntityType;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  entityId: string;

  @ApiPropertyOptional({ example: { name: 'John Doe', email: 'john.doe@example.com' } })
  oldValues?: Record<string, any>;

  @ApiPropertyOptional({ example: { name: 'John Smith', email: 'john.smith@example.com' } })
  newValues?: Record<string, any>;

  @ApiProperty({ example: '192.168.1.1' })
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' })
  userAgent: string;

  @ApiPropertyOptional({ example: { requestId: 'req-123', sessionId: 'sess-456' } })
  metadata?: Record<string, any>;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  timestamp: Date;
}

export class AuditStatsDto {
  @ApiProperty({ example: 1000 })
  totalLogs: number;

  @ApiProperty({ example: { [AuditAction.CREATE]: 300, [AuditAction.UPDATE]: 500 } })
  actionCounts: Record<AuditAction, number>;

  @ApiProperty({ example: { [AuditEntityType.USER]: 400, [AuditEntityType.PROJECT]: 300 } })
  entityCounts: Record<AuditEntityType, number>;

  @ApiProperty({ example: 50 })
  uniqueUsers: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  oldestLog: Date;

  @ApiProperty({ example: '2023-12-31T23:59:59.999Z' })
  newestLog: Date;

  @ApiProperty({ example: 10.5 })
  averageLogsPerDay: number;
}

export class AuditResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ enum: AuditAction })
  action: AuditAction;

  @ApiProperty({ enum: AuditEntityType })
  entityType: AuditEntityType;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  entityId: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  userId?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  userEmail?: string;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  userAgent?: string;

  @ApiProperty({ example: '2023-01-15T00:00:00.000Z' })
  timestamp: Date;

  @ApiPropertyOptional()
  changes?: Record<string, any>;

  @ApiPropertyOptional()
  oldValues?: Record<string, any>;

  @ApiPropertyOptional()
  newValues?: Record<string, any>;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

export class AuditStatsResponseDto {
  @ApiProperty({ example: 1000 })
  totalLogs: number;

  @ApiProperty({ type: [Object] })
  actionStats: Array<{
    action: AuditAction;
    count: number;
  }>;

  @ApiProperty({ type: [Object] })
  entityTypeStats: Array<{
    entityType: AuditEntityType;
    count: number;
  }>;

  @ApiProperty({ type: [Object] })
  topUsers: Array<{
    userId: string;
    userEmail: string;
    userName: string;
    count: number;
  }>;

  @ApiProperty({ type: [Object] })
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
}

export class AuditListResponseDto {
  @ApiProperty({ type: [AuditLogDto] })
  data: AuditLogDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPrevPage: boolean;
}

export class CreateAuditLogDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsString()
  userEmail: string;

  @ApiProperty({ enum: AuditAction })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({ enum: AuditEntityType })
  @IsEnum(AuditEntityType)
  entityType: AuditEntityType;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ example: { name: 'John Doe' } })
  @IsOptional()
  @IsObject()
  oldValues?: Record<string, any>;

  @ApiPropertyOptional({ example: { name: 'John Smith' } })
  @IsOptional()
  @IsObject()
  newValues?: Record<string, any>;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' })
  @IsString()
  userAgent: string;

  @ApiPropertyOptional({ example: { requestId: 'req-123' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AuditComplianceReportDto {
  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2023-12-31T23:59:59.999Z' })
  endDate: Date;

  @ApiProperty({ example: 5000 })
  totalActivities: number;

  @ApiProperty({ example: 150 })
  uniqueUsers: number;

  @ApiProperty({ example: { [AuditAction.CREATE]: 1000, [AuditAction.UPDATE]: 2000 } })
  actionBreakdown: Record<AuditAction, number>;

  @ApiProperty({ example: { [AuditEntityType.USER]: 1500, [AuditEntityType.PROJECT]: 2000 } })
  entityBreakdown: Record<AuditEntityType, number>;

  @ApiProperty({ example: ['192.168.1.1', '192.168.1.2'] })
  topIpAddresses: string[];

  @ApiProperty({ example: ['john.doe@example.com', 'jane.smith@example.com'] })
  mostActiveUsers: string[];

  @ApiProperty({ example: 25.5 })
  averageActivitiesPerDay: number;

  @ApiProperty({ example: { suspicious: 5, failed: 10 } })
  securityEvents: Record<string, number>;
}
