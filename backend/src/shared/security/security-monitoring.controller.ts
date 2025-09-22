import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityMonitoringService, ThreatSeverity, ThreatType } from './security-monitoring.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RequirePermission } from '../../modules/auth/decorators/permissions.decorator';
import { Permission } from '../../modules/auth/services/permissions.service';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { UserDocument } from '../database/schemas/user.schema';

@ApiTags('Security Monitoring')
@Controller('security')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SecurityMonitoringController {
  constructor(private readonly securityService: SecurityMonitoringService) {}

  @Get('metrics')
  @RequirePermission(Permission.SYSTEM_AUDIT)
  @ApiOperation({ summary: 'Get security metrics' })
  @ApiResponse({
    status: 200,
    description: 'Security metrics retrieved successfully',
  })
  async getSecurityMetrics(
    @Query('timeframe') timeframe: 'hour' | 'day' | 'week' | 'month' = 'day',
  ) {
    const metrics = await this.securityService.getSecurityMetrics(timeframe);
    return {
      success: true,
      data: metrics,
      timeframe,
      timestamp: new Date(),
    };
  }

  @Get('threats')
  @RequirePermission(Permission.SYSTEM_AUDIT)
  @ApiOperation({ summary: 'Get active security threats' })
  @ApiResponse({
    status: 200,
    description: 'Active threats retrieved successfully',
  })
  async getActiveThreats(
    @Query('severity') severity?: ThreatSeverity,
    @Query('limit') limit: number = 50,
  ) {
    const threats = this.securityService.getActiveThreats(severity);
    const limitedThreats = threats.slice(0, limit);
    
    return {
      success: true,
      data: limitedThreats,
      total: threats.length,
      filtered: limitedThreats.length,
      severity,
    };
  }

  @Get('suspicious-ips')
  @RequirePermission(Permission.SYSTEM_AUDIT)
  @ApiOperation({ summary: 'Get suspicious IP addresses' })
  @ApiResponse({
    status: 200,
    description: 'Suspicious IPs retrieved successfully',
  })
  async getSuspiciousIPs(@Query('limit') limit: number = 20) {
    const suspiciousIPs = this.securityService.getSuspiciousIPs();
    const limitedIPs = suspiciousIPs.slice(0, limit);
    
    return {
      success: true,
      data: limitedIPs,
      total: suspiciousIPs.length,
      filtered: limitedIPs.length,
    };
  }

  @Post('threats/:threatId/resolve')
  @RequirePermission(Permission.SYSTEM_AUDIT)
  @ApiOperation({ summary: 'Resolve a security threat' })
  @ApiResponse({
    status: 200,
    description: 'Threat resolved successfully',
  })
  async resolveThreat(
    @Param('threatId') threatId: string,
    @CurrentUser() user: UserDocument,
  ) {
    const resolved = await this.securityService.resolveThreat(
      threatId,
      `${user.firstName} ${user.lastName} (${user.email})`,
    );

    if (!resolved) {
      return {
        success: false,
        message: 'Threat not found or already resolved',
      };
    }

    return {
      success: true,
      message: 'Threat resolved successfully',
      threatId,
      resolvedBy: user.email,
      resolvedAt: new Date(),
    };
  }

  @Post('threats/report')
  @RequirePermission(Permission.SYSTEM_AUDIT)
  @ApiOperation({ summary: 'Report a security threat manually' })
  @ApiResponse({
    status: 201,
    description: 'Threat reported successfully',
  })
  async reportThreat(
    @Body() body: {
      type: ThreatType;
      source: string;
      description: string;
      severity?: ThreatSeverity;
      metadata?: any;
    },
    @CurrentUser() user: UserDocument,
  ) {
    const threat = await this.securityService.reportThreat(
      body.type,
      body.source,
      body.description,
      {
        ...body.metadata,
        reportedBy: user.email,
        reportedAt: new Date(),
      },
      body.severity,
    );

    return {
      success: true,
      message: 'Threat reported successfully',
      data: threat,
    };
  }

  @Get('dashboard')
  @RequirePermission(Permission.SYSTEM_AUDIT)
  @ApiOperation({ summary: 'Get security dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Security dashboard data retrieved successfully',
  })
  async getSecurityDashboard() {
    const [metrics, activeThreats, suspiciousIPs] = await Promise.all([
      this.securityService.getSecurityMetrics('day'),
      this.securityService.getActiveThreats(),
      this.securityService.getSuspiciousIPs(),
    ]);

    // Get recent high-severity threats
    const recentHighThreats = activeThreats
      .filter(t => [ThreatSeverity.HIGH, ThreatSeverity.CRITICAL].includes(t.severity))
      .slice(0, 10);

    // Get top threat sources
    const topSources = suspiciousIPs.slice(0, 5);

    // Calculate threat trends (simplified)
    const threatTrends = {
      increasing: metrics.threatsToday > 10,
      stable: metrics.threatsToday >= 5 && metrics.threatsToday <= 10,
      decreasing: metrics.threatsToday < 5,
    };

    return {
      success: true,
      data: {
        overview: {
          totalThreats: metrics.totalThreats,
          threatsToday: metrics.threatsToday,
          activeThreats: activeThreats.length,
          resolvedThreats: metrics.resolvedThreats,
          averageResolutionTime: metrics.averageResolutionTime,
        },
        threatsByType: metrics.threatsByType,
        threatsBySeverity: metrics.threatsBySeverity,
        recentHighThreats,
        topSources,
        threatTrends,
        lastUpdated: new Date(),
      },
    };
  }

  @Get('health')
  @RequirePermission(Permission.SYSTEM_AUDIT)
  @ApiOperation({ summary: 'Get security system health' })
  @ApiResponse({
    status: 200,
    description: 'Security system health retrieved successfully',
  })
  async getSecurityHealth() {
    const metrics = await this.securityService.getSecurityMetrics('hour');
    const activeThreats = this.securityService.getActiveThreats();
    
    // Calculate health score (0-100)
    let healthScore = 100;
    
    // Deduct points for active critical threats
    const criticalThreats = activeThreats.filter(t => t.severity === ThreatSeverity.CRITICAL);
    healthScore -= criticalThreats.length * 20;
    
    // Deduct points for high threat volume
    if (metrics.threatsToday > 50) healthScore -= 15;
    else if (metrics.threatsToday > 20) healthScore -= 10;
    else if (metrics.threatsToday > 10) healthScore -= 5;
    
    // Deduct points for unresolved threats
    const unresolvedThreats = activeThreats.length;
    if (unresolvedThreats > 20) healthScore -= 10;
    else if (unresolvedThreats > 10) healthScore -= 5;
    
    healthScore = Math.max(0, healthScore);
    
    let status: 'healthy' | 'warning' | 'critical';
    if (healthScore >= 80) status = 'healthy';
    else if (healthScore >= 60) status = 'warning';
    else status = 'critical';
    
    return {
      success: true,
      data: {
        status,
        healthScore,
        criticalThreats: criticalThreats.length,
        totalActiveThreats: activeThreats.length,
        threatsToday: metrics.threatsToday,
        systemUptime: process.uptime(),
        lastCheck: new Date(),
        recommendations: this.getHealthRecommendations(status, criticalThreats.length, unresolvedThreats),
      },
    };
  }

  private getHealthRecommendations(
    status: string,
    criticalThreats: number,
    unresolvedThreats: number,
  ): string[] {
    const recommendations: string[] = [];
    
    if (status === 'critical') {
      recommendations.push('Immediate attention required - critical security threats detected');
    }
    
    if (criticalThreats > 0) {
      recommendations.push(`Resolve ${criticalThreats} critical threat(s) immediately`);
    }
    
    if (unresolvedThreats > 10) {
      recommendations.push('High number of unresolved threats - consider increasing security team capacity');
    }
    
    if (status === 'warning') {
      recommendations.push('Monitor security metrics closely and prepare incident response');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Security system operating normally');
    }
    
    return recommendations;
  }
}
