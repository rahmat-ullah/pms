import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { ProjectsModule } from './modules/projects/projects.module';

import { DatabaseModule } from './shared/database/database.module';
import { LoggerModule } from './shared/logger/logger.module';
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
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryWrites: true,
        w: 'majority',
        maxPoolSize: configService.get<number>('MONGODB_MAX_POOL_SIZE', 10),
        minPoolSize: configService.get<number>('MONGODB_MIN_POOL_SIZE', 5),
        maxIdleTimeMS: configService.get<number>('MONGODB_MAX_IDLE_TIME_MS', 30000),
        serverSelectionTimeoutMS: configService.get<number>('MONGODB_SERVER_SELECTION_TIMEOUT_MS', 5000),
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      }),
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

    // Feature modules
    HealthModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
