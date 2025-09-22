import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
  Res,
  Ip,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';
import { CSRFService } from './services/csrf.service';
import { PermissionsService } from './services/permissions.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
} from './dto/auth.dto';
import { UserDocument } from '../../shared/database/schemas/user.schema';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
    private readonly csrfService: CSRFService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const authResult = await this.authService.login(loginDto, ipAddress, request.get('User-Agent'));

    // Create session
    const session = await this.sessionService.createSession(
      authResult.user.id,
      authResult.refreshToken,
      request.get('User-Agent') || '',
      ipAddress,
    );

    // Set HttpOnly cookie for refresh token
    response.cookie('refreshToken', authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      path: '/auth',
    });

    // Generate and set CSRF token
    const csrfToken = this.csrfService.generateCSRFToken(session.sessionId);
    response.setHeader('X-CSRF-Token', csrfToken);

    // Don't return refresh token in response body for security
    return {
      ...authResult,
      refreshToken: undefined as any, // Remove from response
      sessionId: session.sessionId,
      csrfToken,
    };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many registration attempts',
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ipAddress: string,
    @Req() request: Request,
  ): Promise<AuthResponseDto> {
    return this.authService.register(registerDto, ipAddress, request.get('User-Agent'));
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  async logout(
    @CurrentUser() user: UserDocument,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    // Get refresh token from cookie
    const refreshToken = request.cookies?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(user._id.toString(), refreshToken);
    }

    // Get session ID from request (could be from header or cookie)
    const sessionId = request.headers['x-session-id'] as string || request.cookies?.sessionId;
    if (sessionId) {
      await this.sessionService.invalidateSession(sessionId, 'User logout');
      this.csrfService.invalidateCSRFToken(sessionId);
    }

    // Clear cookies
    response.clearCookie('refreshToken', { path: '/auth' });
    response.clearCookie('sessionId');

    return { message: 'Logout successful' };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({
    status: 200,
    description: 'Logout from all devices successful',
  })
  async logoutAll(
    @CurrentUser() user: UserDocument,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    await this.authService.logoutAll(user._id.toString());
    await this.sessionService.invalidateAllUserSessions(user._id.toString(), 'Logout all devices');

    // Clear cookies
    response.clearCookie('refreshToken', { path: '/auth' });
    response.clearCookie('sessionId');

    return { message: 'Logout from all devices successful' };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  getProfile(@CurrentUser() user: UserDocument) {
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      permissions: user.permissions,
      profileImage: user.profileImage,
      phoneNumber: user.phoneNumber,
      lastLoginAt: user.lastLoginAt,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password',
  })
  async changePassword(
    @CurrentUser() user: UserDocument,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(user._id.toString(), changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if user exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many password reset attempts',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Ip() ipAddress: string,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(forgotPasswordDto.email, ipAddress);
    return { message: 'Password reset email sent if user exists' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    return { message: 'Password reset successfully' };
  }

  @Public()
  @Post('validate-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate password strength' })
  @ApiResponse({
    status: 200,
    description: 'Password strength validation result',
  })
  async validatePassword(
    @Body() body: { password: string; userInfo?: { email?: string; firstName?: string; lastName?: string } },
  ) {
    return this.passwordService.validatePasswordComplexity(body.password, body.userInfo);
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active sessions' })
  @ApiResponse({
    status: 200,
    description: 'Active sessions retrieved successfully',
  })
  async getActiveSessions(@CurrentUser() user: UserDocument) {
    const sessions = this.sessionService.getUserSessions(user._id.toString());
    return {
      sessions: sessions.map(session => ({
        sessionId: session.sessionId,
        deviceInfo: session.deviceInfo,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        isActive: session.isActive,
      })),
      total: sessions.length,
    };
  }

  @Post('sessions/:sessionId/invalidate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate a specific session' })
  @ApiResponse({
    status: 200,
    description: 'Session invalidated successfully',
  })
  async invalidateSession(
    @CurrentUser() user: UserDocument,
    @Req() request: Request,
  ): Promise<{ message: string }> {
    const sessionId = request.params.sessionId;
    const session = this.sessionService.getSession(sessionId);

    if (!session || session.userId !== user._id.toString()) {
      return { message: 'Session not found or unauthorized' };
    }

    await this.sessionService.invalidateSession(sessionId, 'User requested session termination');
    return { message: 'Session invalidated successfully' };
  }

  @Get('csrf-token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get CSRF token' })
  @ApiResponse({
    status: 200,
    description: 'CSRF token retrieved successfully',
  })
  async getCSRFToken(@Req() request: Request) {
    const sessionId = request.headers['x-session-id'] as string || request.cookies?.sessionId;
    if (!sessionId) {
      return { csrfToken: null, message: 'No active session' };
    }

    const csrfToken = this.csrfService.getCSRFToken(sessionId) || this.csrfService.generateCSRFToken(sessionId);
    return { csrfToken };
  }

  @Get('permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({
    status: 200,
    description: 'User permissions retrieved successfully',
  })
  async getUserPermissions(@CurrentUser() user: UserDocument) {
    const permissions = this.permissionsService.getRolePermissions(user.role);
    const roleHierarchy = this.permissionsService.getRoleHierarchy();

    return {
      role: user.role,
      permissions,
      roleInfo: roleHierarchy.get(user.role),
      permissionCount: permissions.length,
    };
  }

  @Get('permissions/check')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check specific permissions' })
  @ApiResponse({
    status: 200,
    description: 'Permission check result',
  })
  async checkPermissions(
    @CurrentUser() user: UserDocument,
    @Body() body: { permissions: string[]; requireAll?: boolean },
  ) {
    const { permissions, requireAll = false } = body;

    const hasPermission = requireAll
      ? this.permissionsService.hasAllPermissions(user.role, permissions as any)
      : this.permissionsService.hasAnyPermission(user.role, permissions as any);

    return {
      hasPermission,
      role: user.role,
      checkedPermissions: permissions,
      requireAll,
    };
  }

  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authentication status' })
  @ApiResponse({
    status: 200,
    description: 'Authentication status retrieved successfully',
  })
  async getAuthStatus(@CurrentUser() user: UserDocument, @Req() request: Request) {
    const sessionId = request.headers['x-session-id'] as string || request.cookies?.sessionId;
    const session = sessionId ? this.sessionService.getSession(sessionId) : null;

    return {
      isAuthenticated: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        permissions: this.permissionsService.getRolePermissions(user.role),
      },
      session: session ? {
        sessionId: session.sessionId,
        deviceInfo: session.deviceInfo,
        lastActivity: session.lastActivity,
        expiresAt: session.expiresAt,
      } : null,
      timestamp: new Date(),
    };
  }

  @Post('refresh-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Ip() ipAddress: string,
  ) {
    // Get refresh token from cookie
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const result = await this.authService.refreshTokens(refreshToken);

      // Update session activity
      const sessionId = request.headers['x-session-id'] as string || request.cookies?.sessionId;
      if (sessionId) {
        await this.sessionService.updateSessionActivity(sessionId);
      }

      // Set new refresh token in cookie if provided
      if (result.refreshToken) {
        response.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
          path: '/auth',
        });
      }

      // Generate new CSRF token if session exists
      let csrfToken;
      if (sessionId) {
        csrfToken = this.csrfService.refreshCSRFToken(sessionId);
        response.setHeader('X-CSRF-Token', csrfToken);
      }

      return {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        csrfToken,
        user: result.user,
      };
    } catch (error) {
      // Clear invalid refresh token
      response.clearCookie('refreshToken', { path: '/auth' });
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
