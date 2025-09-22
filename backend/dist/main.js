"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./shared/filters/global-exception.filter");
const logging_interceptor_1 = require("./shared/interceptors/logging.interceptor");
const transform_interceptor_1 = require("./shared/interceptors/transform.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        });
        const configService = app.get(config_1.ConfigService);
        const port = configService.get('BACKEND_PORT', 3001);
        const host = configService.get('BACKEND_HOST', '0.0.0.0');
        const apiPrefix = configService.get('API_PREFIX', 'api');
        const apiVersion = configService.get('API_VERSION', 'v1');
        const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');
        const nodeEnv = configService.get('NODE_ENV', 'development');
        app.use((0, helmet_1.default)({
            contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
            crossOriginEmbedderPolicy: false,
        }));
        app.use(compression());
        app.use(cookieParser());
        app.enableCors({
            origin: corsOrigin,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        });
        app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }));
        app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
        app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
        if (configService.get('SWAGGER_ENABLED', true)) {
            const config = new swagger_1.DocumentBuilder()
                .setTitle(configService.get('SWAGGER_TITLE', 'PMS API'))
                .setDescription(configService.get('SWAGGER_DESCRIPTION', 'Project Management Software API'))
                .setVersion(configService.get('SWAGGER_VERSION', '1.0.0'))
                .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            }, 'JWT-auth')
                .addTag('Authentication', 'Authentication and authorization endpoints')
                .addTag('Users', 'User management endpoints')
                .addTag('Employees', 'Employee management endpoints')
                .addTag('Projects', 'Project management endpoints')
                .addTag('Health', 'Health check endpoints')
                .build();
            const document = swagger_1.SwaggerModule.createDocument(app, config);
            swagger_1.SwaggerModule.setup(configService.get('SWAGGER_PATH', 'api/docs'), app, document, {
                swaggerOptions: {
                    persistAuthorization: true,
                    tagsSorter: 'alpha',
                    operationsSorter: 'alpha',
                },
            });
            logger.log(`📚 Swagger documentation available at: http://${host}:${port}/${configService.get('SWAGGER_PATH', 'api/docs')}`);
        }
        await app.listen(port, host);
        logger.log(`🚀 Application is running on: http://${host}:${port}/${apiPrefix}/${apiVersion}`);
        logger.log(`🌍 Environment: ${nodeEnv}`);
        logger.log(`🔗 CORS enabled for: ${corsOrigin}`);
        logger.log(`📊 Health check available at: http://${host}:${port}/health`);
    }
    catch (error) {
        logger.error('❌ Error starting application:', error);
        process.exit(1);
    }
}
process.on('unhandledRejection', (reason, promise) => {
    const logger = new common_1.Logger('UnhandledRejection');
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    const logger = new common_1.Logger('UncaughtException');
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('SIGTERM', () => {
    const logger = new common_1.Logger('SIGTERM');
    logger.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    const logger = new common_1.Logger('SIGINT');
    logger.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
bootstrap();
//# sourceMappingURL=main.js.map