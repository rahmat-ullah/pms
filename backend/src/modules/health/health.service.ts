import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  async getHealthStatus() {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();
    const environment = this.configService.get<string>('NODE_ENV');
    const version = this.configService.get<string>('APP_VERSION');

    try {
      // Check database connection
      const dbStatus = await this.checkDatabaseHealth();
      
      // Check memory usage
      const memoryUsage = this.getMemoryUsage();

      return {
        status: 'ok',
        timestamp,
        uptime,
        environment,
        version,
        database: dbStatus,
        memory: memoryUsage,
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      throw new Error('Service unavailable');
    }
  }

  async getDetailedHealthStatus() {
    const basicHealth = await this.getHealthStatus();
    
    return {
      ...basicHealth,
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid,
        cpuUsage: process.cpuUsage(),
      },
      database: {
        ...basicHealth.database,
        readyState: this.mongoConnection.readyState,
        host: this.mongoConnection.host,
        port: this.mongoConnection.port,
        name: this.mongoConnection.name,
      },
    };
  }

  private async checkDatabaseHealth() {
    const startTime = Date.now();
    
    try {
      // Simple ping to check database connectivity
      await this.mongoConnection.db.admin().ping();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'connected',
        responseTime,
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'disconnected',
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  private getMemoryUsage() {
    const memUsage = process.memoryUsage();
    
    return {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      rss: memUsage.rss,
      external: memUsage.external,
    };
  }
}
