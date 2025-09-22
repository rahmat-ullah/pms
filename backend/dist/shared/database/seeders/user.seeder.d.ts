import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { BaseSeeder } from './base.seeder';
export declare class UserSeeder extends BaseSeeder<UserDocument> {
    constructor(userModel: Model<UserDocument>);
    getCollectionName(): string;
    private getAdminPermissions;
    private getHRPermissions;
    private getProjectManagerPermissions;
    private getTeamLeadPermissions;
    private getEmployeePermissions;
    getData(): Promise<Partial<UserDocument>[]>;
}
