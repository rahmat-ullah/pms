import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { User, UserSchema } from '../../shared/database/schemas/user.schema';
import { AuditModule } from '../../shared/audit/audit.module';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';
import { CSRFService } from './services/csrf.service';
import { PermissionsService } from './services/permissions.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, SessionService, CSRFService, PermissionsService, JwtStrategy, LocalStrategy],
  exports: [AuthService, PasswordService, SessionService, CSRFService, PermissionsService, JwtModule],
})
export class AuthModule {}
