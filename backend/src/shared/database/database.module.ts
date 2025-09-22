import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSchemas } from './schemas';
import { DatabaseRepositories } from './repositories';

@Module({
  imports: [
    MongooseModule.forFeature(DatabaseSchemas),
  ],
  providers: [...DatabaseRepositories],
  exports: [MongooseModule, ...DatabaseRepositories],
})
export class DatabaseModule {}
