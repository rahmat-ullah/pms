import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditService, CreateAuditLogData } from './audit.service';
import { AuditLog, AuditLogDocument, AuditAction, AuditEntityType } from '../database/schemas/audit-log.schema';
import { AuditQueryDto } from './dto/audit.dto';

describe('AuditService', () => {
  let service: AuditService;
  let auditLogModel: jest.Mocked<Model<AuditLogDocument>>;

  const mockAuditLogModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn(),
    aggregate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getModelToken(AuditLog.name),
          useValue: mockAuditLogModel,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditLogModel = module.get(getModelToken(AuditLog.name));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createAuditLog', () => {
    it('should create audit log successfully', async () => {
      const auditData: CreateAuditLogData = {
        action: AuditAction.CREATE,
        entityType: AuditEntityType.USER,
        entityId: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439012',
        newValues: { email: 'test@example.com' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const mockAuditLog = {
        _id: '507f1f77bcf86cd799439013',
        ...auditData,
        timestamp: new Date(),
      };

      mockAuditLogModel.create.mockResolvedValue(mockAuditLog as any);

      const result = await service.createAuditLog(auditData);

      expect(mockAuditLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.CREATE,
          entityType: AuditEntityType.USER,
          entityId: '507f1f77bcf86cd799439011',
          userId: '507f1f77bcf86cd799439012',
          newValues: { email: 'test@example.com' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          timestamp: expect.any(Date),
        })
      );

      expect(result).toEqual(mockAuditLog);
    });

    it('should handle creation errors', async () => {
      const auditData: CreateAuditLogData = {
        action: AuditAction.CREATE,
        entityType: AuditEntityType.USER,
        entityId: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439012',
      };

      const error = new Error('Database error');
      mockAuditLogModel.create.mockRejectedValue(error);

      await expect(service.createAuditLog(auditData)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      const query: AuditQueryDto = {
        page: 1,
        limit: 10,
        action: AuditAction.CREATE,
      };

      const mockLogs = [
        {
          _id: '507f1f77bcf86cd799439013',
          action: AuditAction.CREATE,
          entityType: AuditEntityType.USER,
          timestamp: new Date(),
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockLogs),
      };

      mockAuditLogModel.find.mockReturnValue(mockQuery as any);
      mockAuditLogModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(mockAuditLogModel.find).toHaveBeenCalled();
      expect(result).toHaveProperty('auditLogs');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
    });
  });

  describe('getAuditStats', () => {
    it('should return audit statistics', async () => {
      const mockStats = {
        totalLogs: 100,
        actionBreakdown: [
          { action: AuditAction.CREATE, entityType: AuditEntityType.USER, count: 50 },
          { action: AuditAction.UPDATE, entityType: AuditEntityType.USER, count: 30 },
        ],
      };

      mockAuditLogModel.aggregate.mockResolvedValue([]);
      mockAuditLogModel.countDocuments.mockResolvedValue(100);

      const result = await service.getAuditStats();

      expect(mockAuditLogModel.aggregate).toHaveBeenCalled();
      expect(result).toHaveProperty('totalLogs');
      expect(result).toHaveProperty('actionBreakdown');
    });
  });

  describe('findById', () => {
    it('should find audit log by id', async () => {
      const mockAuditLog = {
        _id: '507f1f77bcf86cd799439013',
        action: AuditAction.CREATE,
        entityType: AuditEntityType.USER,
        timestamp: new Date(),
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAuditLog),
      };

      mockAuditLogModel.findById.mockReturnValue(mockQuery as any);

      const result = await service.findById('507f1f77bcf86cd799439013');

      expect(mockAuditLogModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
      expect(result).toBeDefined();
    });

    it('should return null for non-existent id', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockAuditLogModel.findById.mockReturnValue(mockQuery as any);

      const result = await service.findById('507f1f77bcf86cd799439013');

      expect(result).toBeNull();
    });
  });

  describe('cleanupOldLogs', () => {
    it('should cleanup old logs successfully', async () => {
      mockAuditLogModel.deleteMany.mockResolvedValue({ deletedCount: 10 } as any);

      const result = await service.cleanupOldLogs(365);

      expect(mockAuditLogModel.deleteMany).toHaveBeenCalledWith({
        timestamp: { $lt: expect.any(Date) },
      });
      expect(result).toEqual({ deletedCount: 10 });
    });
  });
});
