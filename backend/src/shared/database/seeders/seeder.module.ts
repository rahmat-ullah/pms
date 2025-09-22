import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { Employee, EmployeeSchema } from '../schemas/employee.schema';
import { UserSeeder } from './user.seeder';
import { EmployeeSeeder } from './employee.seeder';
import { DatabaseSeeder } from './database.seeder';
import { SeederController } from './seeder.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  providers: [
    UserSeeder,
    EmployeeSeeder,
    DatabaseSeeder,
  ],
  controllers: [SeederController],
  exports: [DatabaseSeeder],
})
export class SeederModule {}
