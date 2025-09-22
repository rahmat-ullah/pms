import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeSeeder } from './employee.seeder';
import { Employee, EmployeeDocument, EmploymentStatus } from '../schemas/employee.schema';
import { User, UserDocument } from '../schemas/user.schema';

describe('EmployeeSeeder', () => {
  let seeder: EmployeeSeeder;
  let employeeModel: jest.Mocked<Model<EmployeeDocument>>;
  let userModel: jest.Mocked<Model<UserDocument>>;

  const mockEmployeeModel = {
    insertMany: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockUserModel = {
    find: jest.fn(),
  };

  const mockUsers = [
    {
      _id: '507f1f77bcf86cd799439011',
      email: 'admin@pms.com',
      firstName: 'John',
      lastName: 'Admin',
    },
    {
      _id: '507f1f77bcf86cd799439012',
      email: 'user@pms.com',
      firstName: 'Jane',
      lastName: 'User',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeSeeder,
        {
          provide: getModelToken(Employee.name),
          useValue: mockEmployeeModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    seeder = module.get<EmployeeSeeder>(EmployeeSeeder);
    employeeModel = module.get(getModelToken(Employee.name));
    userModel = module.get(getModelToken(User.name));

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getCollectionName', () => {
    it('should return "employees"', () => {
      expect(seeder.getCollectionName()).toBe('employees');
    });
  });

  describe('seed', () => {
    it('should seed employees successfully when collection is empty', async () => {
      mockEmployeeModel.countDocuments.mockResolvedValue(0);
      mockUserModel.find.mockResolvedValue(mockUsers);
      mockEmployeeModel.insertMany.mockResolvedValue([]);

      await seeder.seed();

      expect(mockEmployeeModel.countDocuments).toHaveBeenCalled();
      expect(mockUserModel.find).toHaveBeenCalled();
      expect(mockEmployeeModel.insertMany).toHaveBeenCalled();
    });

    it('should skip seeding when collection already has data', async () => {
      mockEmployeeModel.countDocuments.mockResolvedValue(5);

      await seeder.seed();

      expect(mockEmployeeModel.countDocuments).toHaveBeenCalled();
      expect(mockEmployeeModel.insertMany).not.toHaveBeenCalled();
    });

    it('should handle seeding errors', async () => {
      mockEmployeeModel.countDocuments.mockResolvedValue(0);
      const error = new Error('Database error');
      mockUserModel.find.mockRejectedValue(error);

      await expect(seeder.seed()).rejects.toThrow('Database error');
    });
  });

  describe('clear', () => {
    it('should clear all employees successfully', async () => {
      mockEmployeeModel.deleteMany.mockResolvedValue({ deletedCount: 3 } as any);

      await seeder.clear();

      expect(mockEmployeeModel.deleteMany).toHaveBeenCalledWith({});
    });

    it('should handle clearing errors', async () => {
      const error = new Error('Database error');
      mockEmployeeModel.deleteMany.mockRejectedValue(error);

      await expect(seeder.clear()).rejects.toThrow('Database error');
    });
  });

  describe('data generation methods', () => {
    it('should generate valid salary amounts', () => {
      const salary = (seeder as any).generateSalary('Software Engineer', 'Engineering');
      
      expect(typeof salary).toBe('number');
      expect(salary).toBeGreaterThan(50000);
      expect(salary).toBeLessThan(200000);
    });

    it('should generate work experience arrays', () => {
      const experience = (seeder as any).generateWorkExperience();
      
      expect(Array.isArray(experience)).toBe(true);
      expect(experience.length).toBeGreaterThan(0);
      expect(experience.length).toBeLessThanOrEqual(4);
      
      if (experience.length > 0) {
        expect(experience[0]).toHaveProperty('company');
        expect(experience[0]).toHaveProperty('position');
        expect(experience[0]).toHaveProperty('startDate');
        expect(experience[0]).toHaveProperty('endDate');
        expect(experience[0]).toHaveProperty('description');
      }
    });

    it('should generate education arrays', () => {
      const education = (seeder as any).generateEducation();
      
      expect(Array.isArray(education)).toBe(true);
      expect(education.length).toBeGreaterThan(0);
      expect(education.length).toBeLessThanOrEqual(3);
      
      if (education.length > 0) {
        expect(education[0]).toHaveProperty('institution');
        expect(education[0]).toHaveProperty('degree');
        expect(education[0]).toHaveProperty('fieldOfStudy');
        expect(education[0]).toHaveProperty('startDate');
        expect(education[0]).toHaveProperty('endDate');
      }
    });
  });

  describe('utility methods', () => {
    it('should generate valid phone numbers', () => {
      const phone = (seeder as any).generatePhoneNumber();
      
      expect(phone).toMatch(/^\+1-\d{3}-\d{3}-\d{4}$/);
    });

    it('should generate valid addresses', () => {
      const address = (seeder as any).generateAddress();
      
      expect(typeof address).toBe('string');
      expect(address.length).toBeGreaterThan(0);
    });

    it('should generate valid zip codes', () => {
      const zipCode = (seeder as any).generateZipCode();
      
      expect(zipCode).toMatch(/^\d{5}$/);
    });
  });
});
