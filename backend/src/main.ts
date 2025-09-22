import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Create NestJS application
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Get configuration service
    const configService = app.get(ConfigService);
    const port = configService.get<number>('BACKEND_PORT', 3001);
    const host = configService.get<string>('BACKEND_HOST', '0.0.0.0');
    const apiPrefix = configService.get<string>('API_PREFIX', 'api');
    const apiVersion = configService.get<string>('API_VERSION', 'v1');
    const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }));

    // Compression middleware
    app.use(compression());

    // Cookie parser middleware
    app.use(cookieParser());

    // CORS configuration
    app.enableCors({
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Global API prefix
    app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Global interceptors
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new TransformInterceptor(),
    );

    // Swagger documentation setup
    if (configService.get<boolean>('SWAGGER_ENABLED', true)) {
      const config = new DocumentBuilder()
        .setTitle(configService.get<string>('SWAGGER_TITLE', 'PMS API'))
        .setDescription(configService.get<string>('SWAGGER_DESCRIPTION', 'Project Management Software API'))
        .setVersion(configService.get<string>('SWAGGER_VERSION', '1.0.0'))
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .addTag('Authentication', 'Authentication and authorization endpoints')
        .addTag('Users', 'User management endpoints')
        .addTag('Employees', 'Employee management endpoints')
        .addTag('Projects', 'Project management endpoints')
        .addTag('Health', 'Health check endpoints')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup(configService.get<string>('SWAGGER_PATH', 'api/docs'), app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
      });

      logger.log(`📚 Swagger documentation available at: http://${host}:${port}/${configService.get<string>('SWAGGER_PATH', 'api/docs')}`);
    }

    // Start the application
    await app.listen(port, host);

    logger.log(`🚀 Application is running on: http://${host}:${port}/${apiPrefix}/${apiVersion}`);
    logger.log(`🌍 Environment: ${nodeEnv}`);
    logger.log(`🔗 CORS enabled for: ${corsOrigin}`);
    logger.log(`📊 Health check available at: http://${host}:${port}/health`);

  } catch (error) {
    logger.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  const logger = new Logger('SIGTERM');
  logger.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  const logger = new Logger('SIGINT');
  logger.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

bootstrap();
