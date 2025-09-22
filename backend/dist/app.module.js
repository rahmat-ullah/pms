"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const health_module_1 = require("./modules/health/health.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const employees_module_1 = require("./modules/employees/employees.module");
const projects_module_1 = require("./modules/projects/projects.module");
const files_module_1 = require("./modules/files/files.module");
const database_module_1 = require("./shared/database/database.module");
const logger_module_1 = require("./shared/logger/logger.module");
const audit_module_1 = require("./shared/audit/audit.module");
const audit_interceptor_1 = require("./shared/audit/audit.interceptor");
const seeder_module_1 = require("./shared/database/seeders/seeder.module");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const validation_schema_1 = require("./config/validation.schema");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
                validationSchema: validation_schema_1.validationSchema,
                validationOptions: {
                    allowUnknown: true,
                    abortEarly: true,
                },
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const mongoUri = configService.get('MONGODB_URI');
                    console.log('🔗 Connecting to MongoDB:', mongoUri?.replace(/\/\/.*@/, '//***:***@'));
                    return {
                        uri: mongoUri,
                        retryWrites: true,
                        w: 'majority',
                        maxPoolSize: configService.get('MONGODB_MAX_POOL_SIZE', 10),
                        minPoolSize: configService.get('MONGODB_MIN_POOL_SIZE', 5),
                        maxIdleTimeMS: configService.get('MONGODB_MAX_IDLE_TIME_MS', 30000),
                        serverSelectionTimeoutMS: configService.get('MONGODB_SERVER_SELECTION_TIMEOUT_MS', 5000),
                        socketTimeoutMS: 45000,
                        family: 4,
                        connectTimeoutMS: 10000,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => [
                    {
                        ttl: configService.get('RATE_LIMIT_WINDOW_MS', 60000),
                        limit: configService.get('RATE_LIMIT_MAX_REQUESTS', 100),
                    },
                ],
                inject: [config_1.ConfigService],
            }),
            database_module_1.DatabaseModule,
            logger_module_1.LoggerModule,
            audit_module_1.AuditModule,
            seeder_module_1.SeederModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            employees_module_1.EmployeesModule,
            projects_module_1.ProjectsModule,
            files_module_1.FilesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map