import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { User, UserDocument, UserRole, UserStatus } from '../../shared/database/schemas/user.schema';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';
import { AuditService } from '../../shared/audit/audit.service';
import { PermissionsService } from './services/permissions.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: jest.Mocked<Model<UserDocument>>;
  let jwtService: jest.Mocked<JwtService>;
  let passwordService: jest.Mocked<PasswordService>;
  let sessionService: jest.Mocked<SessionService>;
  let auditService: jest.Mocked<AuditService>;
  let permissionsService: jest.Mocked<PermissionsService>;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockPasswordService = {
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
    validatePasswordComplexity: jest.fn(),
  };

  const mockSessionService = {
    createSession: jest.fn(),
    validateSession: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllSessions: jest.fn(),
  };

  const mockAuditService = {
    logSecurityEvent: jest.fn(),
    createAuditLog: jest.fn(),
  };

  const mockPermissionsService = {
    getUserPermissions: jest.fn(),
    hasPermission: jest.fn(),
  };

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    isActive: true,
    emailVerifiedAt: new Date(),
    failedLoginAttempts: 0,
    accountLockedUntil: null,
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get(JwtService);
    passwordService = module.get(PasswordService);
    sessionService = module.get(SessionService);
    auditService = module.get(AuditService);
    permissionsService = module.get(PermissionsService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockPasswordService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      mockSessionService.createSession.mockResolvedValue({
        sessionId: 'session-123',
        expiresAt: new Date(),
      });
      mockPermissionsService.getUserPermissions.mockResolvedValue({
        canManageUsers: false,
        canManageEmployees: false,
      });

      const result = await service.login(loginDto, '192.168.1.1', 'Mozilla/5.0');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
        status: { $ne: UserStatus.ARCHIVED },
      });
      expect(mockPasswordService.validatePassword).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockSessionService.createSession).toHaveBeenCalled();
      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith(
        'User login successful',
        '507f1f77bcf86cd799439011',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual({
        user: expect.objectContaining({
          id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.EMPLOYEE,
        }),
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
        permissions: {
          canManageUsers: false,
          canManageEmployees: false,
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockPasswordService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto, '192.168.1.1', 'Mozilla/5.0'))
        .rejects.toThrow(UnauthorizedException);

      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith(
        'Failed login attempt - invalid password',
        '507f1f77bcf86cd799439011',
        '192.168.1.1',
        'Mozilla/5.0'
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto, '192.168.1.1', 'Mozilla/5.0'))
        .rejects.toThrow(UnauthorizedException);

      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith(
        'Failed login attempt - user not found',
        null,
        '192.168.1.1',
        'Mozilla/5.0',
        { email: 'test@example.com' }
      );
    });

    it('should handle account lockout', async () => {
      const lockedUser = {
        ...mockUser,
        accountLockedUntil: new Date(Date.now() + 60000), // Locked for 1 minute
      };
      mockUserModel.findOne.mockResolvedValue(lockedUser);

      await expect(service.login(loginDto, '192.168.1.1', 'Mozilla/5.0'))
        .rejects.toThrow(UnauthorizedException);

      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith(
        'Login attempt on locked account',
        '507f1f77bcf86cd799439011',
        '192.168.1.1',
        'Mozilla/5.0'
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should register user successfully', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockPasswordService.validatePasswordComplexity.mockReturnValue({ isValid: true });
      mockPasswordService.hashPassword.mockResolvedValue('hashedPassword');
      mockUserModel.create.mockResolvedValue({
        ...registerDto,
        _id: '507f1f77bcf86cd799439012',
        password: 'hashedPassword',
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
      });

      const result = await service.register(registerDto, '192.168.1.1', 'Mozilla/5.0');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'newuser@example.com' });
      expect(mockPasswordService.validatePasswordComplexity).toHaveBeenCalledWith('password123');
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith('password123');
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith(
        'User registration successful',
        '507f1f77bcf86cd799439012',
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(result).toEqual({
        user: expect.objectContaining({
          id: '507f1f77bcf86cd799439012',
          email: 'newuser@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
        }),
        message: 'Registration successful',
      });
    });

    it('should throw ConflictException for existing email', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto, '192.168.1.1', 'Mozilla/5.0'))
        .rejects.toThrow(ConflictException);

      expect(mockAuditService.logSecurityEvent).toHaveBeenCalledWith(
        'Registration attempt with existing email',
        null,
        '192.168.1.1',
        'Mozilla/5.0',
        { email: 'newuser@example.com' }
      );
    });

    it('should throw error for weak password', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockPasswordService.validatePasswordComplexity.mockReturnValue({
        isValid: false,
        errors: ['Password too short'],
      });

      await expect(service.register(registerDto, '192.168.1.1', 'Mozilla/5.0'))
        .rejects.toThrow('Password does not meet complexity requirements: Password too short');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const payload = { sub: '507f1f77bcf86cd799439011', email: 'test@example.com' };
      const userWithRefreshTokens = {
        ...mockUser,
        refreshTokens: ['refresh-token'],
      };

      mockJwtService.verify.mockReturnValue(payload);
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userWithRefreshTokens),
      };
      mockUserModel.findById.mockReturnValue(mockQuery as any);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(undefined);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refreshTokens('refresh-token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('refresh-token', expect.any(Object));
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens('invalid-token'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValue(undefined);

      await service.logout('507f1f77bcf86cd799439011', 'refresh-token');

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { $pull: { refreshTokens: 'refresh-token' } }
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      };
      mockUserModel.findOne.mockReturnValue(mockQuery as any);
      mockPasswordService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid credentials', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      };
      mockUserModel.findOne.mockReturnValue(mockQuery as any);
      mockPasswordService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });
});
