import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { FilesModule } from './modules/files/files.module';

import { DatabaseModule } from './shared/database/database.module';
import { LoggerModule } from './shared/logger/logger.module';
import { AuditModule } from './shared/audit/audit.module';
import { AuditInterceptor } from './shared/audit/audit.interceptor';
import { SeederModule } from './shared/database/seeders/seeder.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    // Configuration module with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // Database connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGODB_URI');
        console.log('🔗 Connecting to MongoDB:', mongoUri?.replace(/\/\/.*@/, '//***:***@'));

        return {
          uri: mongoUri,
          retryWrites: true,
          w: 'majority',
          maxPoolSize: configService.get<number>('MONGODB_MAX_POOL_SIZE', 10),
          minPoolSize: configService.get<number>('MONGODB_MIN_POOL_SIZE', 5),
          maxIdleTimeMS: configService.get<number>('MONGODB_MAX_IDLE_TIME_MS', 30000),
          serverSelectionTimeoutMS: configService.get<number>('MONGODB_SERVER_SELECTION_TIMEOUT_MS', 5000),
          socketTimeoutMS: 45000,
          family: 4, // Use IPv4, skip trying IPv6
          connectTimeoutMS: 10000,
        };
      },
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('RATE_LIMIT_WINDOW_MS', 60000),
          limit: configService.get<number>('RATE_LIMIT_MAX_REQUESTS', 100),
        },
      ],
      inject: [ConfigService],
    }),

    // Shared modules
    DatabaseModule,
    LoggerModule,
    AuditModule,
    SeederModule,

    // Feature modules
    HealthModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    ProjectsModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
