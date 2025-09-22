import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { StorageService } from './storage.service';
import { FileMetadataService } from './file-metadata.service';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [StorageService, FileMetadataService],
  exports: [StorageService, FileMetadataService],
})
export class StorageModule {}
