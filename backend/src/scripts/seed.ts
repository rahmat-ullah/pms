#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { DatabaseSeeder } from '../shared/database/seeders/database.seeder';

async function bootstrap() {
  const logger = new Logger('SeedScript');
  
  try {
    logger.log('Starting seed script...');
    
    // Create the Nest application
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Get the seeder service
    const seeder = app.get(DatabaseSeeder);

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'seed';

    switch (command) {
      case 'seed':
        logger.log('Seeding all collections...');
        await seeder.seedAll();
        break;
        
      case 'clear':
        logger.log('Clearing all collections...');
        await seeder.clearAll();
        break;
        
      case 'reseed':
        logger.log('Reseeding all collections...');
        await seeder.reseedAll();
        break;
        
      case 'seed-users':
        logger.log('Seeding users collection...');
        await seeder.seedUsers();
        break;
        
      case 'seed-employees':
        logger.log('Seeding employees collection...');
        await seeder.seedEmployees();
        break;
        
      case 'clear-users':
        logger.log('Clearing users collection...');
        await seeder.clearUsers();
        break;
        
      case 'clear-employees':
        logger.log('Clearing employees collection...');
        await seeder.clearEmployees();
        break;
        
      case 'status':
        logger.log('Getting seeder status...');
        const status = await seeder.getSeederStatus();
        console.log('Seeder Status:', JSON.stringify(status, null, 2));
        break;
        
      default:
        logger.error(`Unknown command: ${command}`);
        logger.log('Available commands:');
        logger.log('  seed          - Seed all collections');
        logger.log('  clear         - Clear all collections');
        logger.log('  reseed        - Clear and reseed all collections');
        logger.log('  seed-users    - Seed users collection');
        logger.log('  seed-employees - Seed employees collection');
        logger.log('  clear-users   - Clear users collection');
        logger.log('  clear-employees - Clear employees collection');
        logger.log('  status        - Get seeder status');
        process.exit(1);
    }

    logger.log('Seed script completed successfully!');
    await app.close();
    process.exit(0);
    
  } catch (error) {
    logger.error('Seed script failed:', error.message);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();
