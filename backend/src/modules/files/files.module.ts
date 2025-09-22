import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { StorageModule } from '../../shared/storage/storage.module';
import { FileMetadata, FileMetadataSchema } from '../../shared/storage/schemas/file-metadata.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileMetadata.name, schema: FileMetadataSchema },
    ]),
    StorageModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
