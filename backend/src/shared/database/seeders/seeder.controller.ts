import { Controller, Post, Get, Delete, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseSeeder } from './database.seeder';

@ApiTags('Database Seeding')
@Controller('api/v1/seeder')
export class SeederController {
  constructor(private readonly databaseSeeder: DatabaseSeeder) {}

  @Get('status')
  @ApiOperation({ summary: 'Get seeder status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Seeder status retrieved successfully',
  })
  async getStatus() {
    try {
      const status = await this.databaseSeeder.getSeederStatus();
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get seeder status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('seed-all')
  @ApiOperation({ summary: 'Seed all collections' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All collections seeded successfully',
  })
  async seedAll() {
    try {
      await this.databaseSeeder.seedAll();
      return {
        success: true,
        message: 'All collections seeded successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to seed collections',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('clear-all')
  @ApiOperation({ summary: 'Clear all collections' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All collections cleared successfully',
  })
  async clearAll() {
    try {
      await this.databaseSeeder.clearAll();
      return {
        success: true,
        message: 'All collections cleared successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to clear collections',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reseed-all')
  @ApiOperation({ summary: 'Clear and reseed all collections' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All collections reseeded successfully',
  })
  async reseedAll() {
    try {
      await this.databaseSeeder.reseedAll();
      return {
        success: true,
        message: 'All collections reseeded successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to reseed collections',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('seed-users')
  @ApiOperation({ summary: 'Seed users collection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users collection seeded successfully',
  })
  async seedUsers() {
    try {
      await this.databaseSeeder.seedUsers();
      return {
        success: true,
        message: 'Users collection seeded successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to seed users collection',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('seed-employees')
  @ApiOperation({ summary: 'Seed employees collection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employees collection seeded successfully',
  })
  async seedEmployees() {
    try {
      await this.databaseSeeder.seedEmployees();
      return {
        success: true,
        message: 'Employees collection seeded successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to seed employees collection',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('clear-users')
  @ApiOperation({ summary: 'Clear users collection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users collection cleared successfully',
  })
  async clearUsers() {
    try {
      await this.databaseSeeder.clearUsers();
      return {
        success: true,
        message: 'Users collection cleared successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to clear users collection',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('clear-employees')
  @ApiOperation({ summary: 'Clear employees collection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employees collection cleared successfully',
  })
  async clearEmployees() {
    try {
      await this.databaseSeeder.clearEmployees();
      return {
        success: true,
        message: 'Employees collection cleared successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to clear employees collection',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reseed-users')
  @ApiOperation({ summary: 'Clear and reseed users collection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users collection reseeded successfully',
  })
  async reseedUsers() {
    try {
      await this.databaseSeeder.reseedUsers();
      return {
        success: true,
        message: 'Users collection reseeded successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to reseed users collection',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reseed-employees')
  @ApiOperation({ summary: 'Clear and reseed employees collection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employees collection reseeded successfully',
  })
  async reseedEmployees() {
    try {
      await this.databaseSeeder.reseedEmployees();
      return {
        success: true,
        message: 'Employees collection reseeded successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to reseed employees collection',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
