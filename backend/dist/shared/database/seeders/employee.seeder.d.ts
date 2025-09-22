import { Model } from 'mongoose';
import { EmployeeDocument } from '../schemas/employee.schema';
import { UserDocument } from '../schemas/user.schema';
import { BaseSeeder } from './base.seeder';
export declare class EmployeeSeeder extends BaseSeeder<EmployeeDocument> {
    private readonly userModel;
    constructor(employeeModel: Model<EmployeeDocument>, userModel: Model<UserDocument>);
    getCollectionName(): string;
    getData(): Promise<Partial<EmployeeDocument>[]>;
    private generatePhoneNumber;
    private generateAddress;
    private generateZipCode;
    private generateEmergencyContactName;
    private generateEmergencyEmail;
    private generateSalary;
    private generateCertification;
    private generateWorkExperience;
    private generateEducation;
    private generateGoals;
    private generateAchievements;
}
