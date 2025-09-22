import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { StorageModule } from '../../shared/storage/storage.module';
import { FilesModule } from '../files/files.module';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

@Module({
  imports: [DatabaseModule, StorageModule, FilesModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
