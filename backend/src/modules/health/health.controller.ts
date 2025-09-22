import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get application health status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Health check successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', example: 12345 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'connected' },
            responseTime: { type: 'number', example: 5 }
          }
        },
        memory: {
          type: 'object',
          properties: {
            used: { type: 'number', example: 123456789 },
            total: { type: 'number', example: 987654321 },
            percentage: { type: 'number', example: 12.5 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Get detailed health information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed health check successful' 
  })
  async getDetailedHealth() {
    return this.healthService.getDetailedHealthStatus();
  }
}
