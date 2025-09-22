import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getAppInfo() {
    return {
      name: this.configService.get<string>('APP_NAME', 'Project Management Software API'),
      version: this.configService.get<string>('APP_VERSION', '1.0.0'),
      description: 'Backend API for Project Management Software',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
