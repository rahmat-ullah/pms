import { Injectable, Logger } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { EmployeeSeeder } from './employee.seeder';

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    private readonly userSeeder: UserSeeder,
    private readonly employeeSeeder: EmployeeSeeder,
  ) {}

  async seedAll(): Promise<void> {
    try {
      this.logger.log('Starting database seeding...');
      
      // Seed in order of dependencies
      await this.userSeeder.seed();
      await this.employeeSeeder.seed();
      
      this.logger.log('Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Database seeding failed:', error.message);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      this.logger.log('Starting database clearing...');
      
      // Clear in reverse order of dependencies
      await this.employeeSeeder.clear();
      await this.userSeeder.clear();
      
      this.logger.log('Database clearing completed successfully!');
    } catch (error) {
      this.logger.error('Database clearing failed:', error.message);
      throw error;
    }
  }

  async reseedAll(): Promise<void> {
    await this.clearAll();
    await this.seedAll();
  }

  async seedUsers(): Promise<void> {
    await this.userSeeder.seed();
  }

  async seedEmployees(): Promise<void> {
    await this.employeeSeeder.seed();
  }

  async clearUsers(): Promise<void> {
    await this.userSeeder.clear();
  }

  async clearEmployees(): Promise<void> {
    await this.employeeSeeder.clear();
  }

  async reseedUsers(): Promise<void> {
    await this.userSeeder.reseed();
  }

  async reseedEmployees(): Promise<void> {
    await this.employeeSeeder.reseed();
  }

  async getSeederStatus(): Promise<any> {
    // This would check the status of each collection
    return {
      users: {
        hasData: await this.userSeeder['model'].countDocuments() > 0,
        count: await this.userSeeder['model'].countDocuments(),
      },
      employees: {
        hasData: await this.employeeSeeder['model'].countDocuments() > 0,
        count: await this.employeeSeeder['model'].countDocuments(),
      },
    };
  }
}
