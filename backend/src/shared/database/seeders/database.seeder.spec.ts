import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseSeeder } from './database.seeder';
import { UserSeeder } from './user.seeder';
import { EmployeeSeeder } from './employee.seeder';

describe('DatabaseSeeder', () => {
  let service: DatabaseSeeder;
  let userSeeder: jest.Mocked<UserSeeder>;
  let employeeSeeder: jest.Mocked<EmployeeSeeder>;

  const mockUserSeeder = {
    seed: jest.fn(),
    clear: jest.fn(),
  };

  const mockEmployeeSeeder = {
    seed: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseSeeder,
        {
          provide: UserSeeder,
          useValue: mockUserSeeder,
        },
        {
          provide: EmployeeSeeder,
          useValue: mockEmployeeSeeder,
        },
      ],
    }).compile();

    service = module.get<DatabaseSeeder>(DatabaseSeeder);
    userSeeder = module.get(UserSeeder);
    employeeSeeder = module.get(EmployeeSeeder);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('seedAll', () => {
    it('should seed all collections successfully', async () => {
      mockUserSeeder.seed.mockResolvedValue(undefined);
      mockEmployeeSeeder.seed.mockResolvedValue(undefined);

      await service.seedAll();

      expect(mockUserSeeder.seed).toHaveBeenCalled();
      expect(mockEmployeeSeeder.seed).toHaveBeenCalled();
    });

    it('should handle seeding failures', async () => {
      const error = new Error('Database connection failed');
      mockUserSeeder.seed.mockRejectedValue(error);

      await expect(service.seedAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('clearAll', () => {
    it('should clear all collections successfully', async () => {
      mockEmployeeSeeder.clear.mockResolvedValue(undefined);
      mockUserSeeder.clear.mockResolvedValue(undefined);

      await service.clearAll();

      expect(mockEmployeeSeeder.clear).toHaveBeenCalled();
      expect(mockUserSeeder.clear).toHaveBeenCalled();
    });

    it('should handle clearing failures', async () => {
      const error = new Error('Clear operation failed');
      mockEmployeeSeeder.clear.mockRejectedValue(error);

      await expect(service.clearAll()).rejects.toThrow('Clear operation failed');
    });
  });

  describe('reseedAll', () => {
    it('should reseed all collections successfully', async () => {
      mockEmployeeSeeder.clear.mockResolvedValue(undefined);
      mockUserSeeder.clear.mockResolvedValue(undefined);
      mockUserSeeder.seed.mockResolvedValue(undefined);
      mockEmployeeSeeder.seed.mockResolvedValue(undefined);

      await service.reseedAll();

      expect(mockEmployeeSeeder.clear).toHaveBeenCalled();
      expect(mockUserSeeder.clear).toHaveBeenCalled();
      expect(mockUserSeeder.seed).toHaveBeenCalled();
      expect(mockEmployeeSeeder.seed).toHaveBeenCalled();
    });
  });
});
