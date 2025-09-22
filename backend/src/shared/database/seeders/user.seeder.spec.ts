import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSeeder } from './user.seeder';
import { User, UserDocument } from '../schemas/user.schema';

describe('UserSeeder', () => {
  let seeder: UserSeeder;
  let userModel: jest.Mocked<Model<UserDocument>>;

  const mockUserModel = {
    insertMany: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSeeder,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    seeder = module.get<UserSeeder>(UserSeeder);
    userModel = module.get(getModelToken(User.name));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getCollectionName', () => {
    it('should return "users"', () => {
      expect(seeder.getCollectionName()).toBe('users');
    });
  });

  describe('seed', () => {
    it('should seed users successfully when collection is empty', async () => {
      mockUserModel.countDocuments.mockResolvedValue(0);
      mockUserModel.insertMany.mockResolvedValue([]);

      await seeder.seed();

      expect(mockUserModel.countDocuments).toHaveBeenCalled();
      expect(mockUserModel.insertMany).toHaveBeenCalled();
    });

    it('should skip seeding when collection already has data', async () => {
      mockUserModel.countDocuments.mockResolvedValue(5);

      await seeder.seed();

      expect(mockUserModel.countDocuments).toHaveBeenCalled();
      expect(mockUserModel.insertMany).not.toHaveBeenCalled();
    });

    it('should handle seeding errors', async () => {
      mockUserModel.countDocuments.mockResolvedValue(0);
      const error = new Error('Database error');
      mockUserModel.insertMany.mockRejectedValue(error);

      await expect(seeder.seed()).rejects.toThrow('Database error');
    });
  });

  describe('clear', () => {
    it('should clear all users successfully', async () => {
      mockUserModel.deleteMany.mockResolvedValue({ deletedCount: 5 } as any);

      await seeder.clear();

      expect(mockUserModel.deleteMany).toHaveBeenCalledWith({});
    });

    it('should handle clearing errors', async () => {
      const error = new Error('Database error');
      mockUserModel.deleteMany.mockRejectedValue(error);

      await expect(seeder.clear()).rejects.toThrow('Database error');
    });
  });

  describe('permission methods', () => {
    it('should return correct admin permissions', () => {
      const permissions = (seeder as any).getAdminPermissions();
      
      expect(permissions).toEqual({
        canManageUsers: true,
        canManageEmployees: true,
        canManageProjects: true,
        canViewReports: true,
        canManageAttendance: true,
        canApproveLeave: true,
        canManagePayroll: true,
        canAccessFinance: true,
        canManageSettings: true,
      });
    });

    it('should return correct employee permissions', () => {
      const permissions = (seeder as any).getEmployeePermissions();
      
      expect(permissions).toEqual({
        canManageUsers: false,
        canManageEmployees: false,
        canManageProjects: false,
        canViewReports: false,
        canManageAttendance: false,
        canApproveLeave: false,
        canManagePayroll: false,
        canAccessFinance: false,
        canManageSettings: false,
      });
    });
  });

  describe('getData', () => {
    it('should generate user data', async () => {
      const data = await seeder.getData();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      if (data.length > 0) {
        expect(data[0]).toHaveProperty('email');
        expect(data[0]).toHaveProperty('firstName');
        expect(data[0]).toHaveProperty('lastName');
        expect(data[0]).toHaveProperty('role');
        expect(data[0]).toHaveProperty('status');
      }
    });
  });
});
