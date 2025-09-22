import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { AuditService } from './audit.service';
import { AuditQueryDto, AuditResponseDto, AuditStatsResponseDto } from './dto/audit.dto';
import { UserRole } from '../database/schemas/user.schema';
import { AuditEntityType } from '../database/schemas/audit-log.schema';
import { SkipAudit } from './audit.interceptor';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get all audit logs with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        auditLogs: {
          type: 'array',
          items: { $ref: '#/components/schemas/AuditResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for statistics (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for statistics (ISO string)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit statistics retrieved successfully',
    type: AuditStatsResponseDto,
  })
  async getAuditStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<AuditStatsResponseDto> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.auditService.getAuditStats(start, end);
  }

  @Get('compliance-report')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Generate compliance report for a date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Start date for report (ISO string)' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'End date for report (ISO string)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compliance report generated successfully',
  })
  async getComplianceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.auditService.getComplianceReport(start, end);
  }

  @Get('entity/:entityId')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get audit logs for a specific entity' })
  @ApiParam({ name: 'entityId', description: 'Entity ID to get audit logs for' })
  @ApiQuery({ name: 'entityType', required: false, enum: AuditEntityType, description: 'Entity type filter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Entity audit logs retrieved successfully',
    type: [AuditResponseDto],
  })
  async findByEntityId(
    @Param('entityId') entityId: string,
    @Query('entityType') entityType?: AuditEntityType,
  ): Promise<AuditResponseDto[]> {
    return this.auditService.findByEntityId(entityId, entityType);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID to get audit logs for' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        auditLogs: {
          type: 'array',
          items: { $ref: '#/components/schemas/AuditResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findByUserId(
    @Param('userId') userId: string,
    @Query() query: AuditQueryDto,
  ) {
    return this.auditService.findByUserId(userId, query);
  }

  @Get('my-activity')
  @ApiOperation({ summary: 'Get current user\'s audit logs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        auditLogs: {
          type: 'array',
          items: { $ref: '#/components/schemas/AuditResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async getMyActivity(
    @CurrentUser() currentUser: any,
    @Query() query: AuditQueryDto,
  ) {
    return this.auditService.findByUserId(currentUser.id, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit log retrieved successfully',
    type: AuditResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Audit log not found',
  })
  async findById(@Param('id') id: string): Promise<AuditResponseDto | null> {
    return this.auditService.findById(id);
  }

  @Post('cleanup')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Clean up old audit logs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Old audit logs cleaned up successfully',
    schema: {
      type: 'object',
      properties: {
        deletedCount: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async cleanupOldLogs(
    @Body('retentionDays') retentionDays: number = 365,
  ) {
    const result = await this.auditService.cleanupOldLogs(retentionDays);
    return {
      ...result,
      message: `Successfully deleted ${result.deletedCount} old audit logs`,
    };
  }

  @Get('export/csv')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Export audit logs to CSV' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit logs exported successfully',
    headers: {
      'Content-Type': {
        description: 'text/csv',
      },
      'Content-Disposition': {
        description: 'attachment; filename="audit-logs.csv"',
      },
    },
  })
  async exportToCsv(@Query() query: AuditQueryDto) {
    // Set a high limit for export
    const exportQuery = { ...query, limit: 10000, page: 1 };
    const { auditLogs } = await this.auditService.findAll(exportQuery);

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Timestamp',
      'Action',
      'Entity Type',
      'Entity ID',
      'User Email',
      'IP Address',
      'User Agent',
      'Changes',
    ];

    const csvRows = auditLogs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.action,
      log.entityType,
      log.entityId,
      log.userEmail || '',
      log.ipAddress || '',
      log.userAgent || '',
      JSON.stringify(log.changes || {}),
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(',')),
    ].join('\n');

    return {
      content: csvContent,
      filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
      contentType: 'text/csv',
    };
  }

  @Get('dashboard/summary')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get audit dashboard summary' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit dashboard summary retrieved successfully',
  })
  async getDashboardSummary() {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyStats, monthlyStats] = await Promise.all([
      this.auditService.getAuditStats(lastWeek, today),
      this.auditService.getAuditStats(lastMonth, today),
    ]);

    return {
      weekly: weeklyStats,
      monthly: monthlyStats,
      summary: {
        weeklyTotal: weeklyStats.totalLogs,
        monthlyTotal: monthlyStats.totalLogs,
        weeklyGrowth: weeklyStats.totalLogs,
        monthlyGrowth: monthlyStats.totalLogs,
      },
    };
  }
}
