import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get application information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Application information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Project Management Software API' },
        version: { type: 'string', example: '1.0.0' },
        description: { type: 'string', example: 'Backend API for Project Management Software' },
        environment: { type: 'string', example: 'development' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', example: 12345 }
      }
    }
  })
  getAppInfo() {
    return this.appService.getAppInfo();
  }
}
