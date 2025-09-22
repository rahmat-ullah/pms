import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { User, UserDocument, UserPermissions } from '../schemas/user.schema';
import { UserRole, UserStatus } from '../schemas/user.schema';
import { BaseSeeder } from './base.seeder';

@Injectable()
export class UserSeeder extends BaseSeeder<UserDocument> {
  constructor(
    @InjectModel(User.name) userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  getCollectionName(): string {
    return 'users';
  }

  private getAdminPermissions(): UserPermissions {
    return {
      canManageUsers: true,
      canManageEmployees: true,
      canManageProjects: true,
      canViewReports: true,
      canManageAttendance: true,
      canApproveLeave: true,
      canManagePayroll: true,
      canAccessFinance: true,
      canManageSettings: true,
    };
  }

  private getHRPermissions(): UserPermissions {
    return {
      canManageUsers: true,
      canManageEmployees: true,
      canManageProjects: false,
      canViewReports: true,
      canManageAttendance: true,
      canApproveLeave: true,
      canManagePayroll: true,
      canAccessFinance: false,
      canManageSettings: false,
    };
  }

  private getProjectManagerPermissions(): UserPermissions {
    return {
      canManageUsers: false,
      canManageEmployees: false,
      canManageProjects: true,
      canViewReports: true,
      canManageAttendance: false,
      canApproveLeave: false,
      canManagePayroll: false,
      canAccessFinance: false,
      canManageSettings: false,
    };
  }

  private getTeamLeadPermissions(): UserPermissions {
    return {
      canManageUsers: false,
      canManageEmployees: false,
      canManageProjects: false,
      canViewReports: true,
      canManageAttendance: false,
      canApproveLeave: false,
      canManagePayroll: false,
      canAccessFinance: false,
      canManageSettings: false,
    };
  }

  private getEmployeePermissions(): UserPermissions {
    return {
      canManageUsers: false,
      canManageEmployees: false,
      canManageProjects: false,
      canViewReports: false,
      canManageAttendance: false,
      canApproveLeave: false,
      canManagePayroll: false,
      canAccessFinance: false,
      canManageSettings: false,
    };
  }

  async getData(): Promise<Partial<UserDocument>[]> {
    const defaultPassword = await argon2.hash('password123');
    
    const users: Partial<UserDocument>[] = [
      // Admin users
      {
        email: 'admin@pms.com',
        password: defaultPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        isActive: true,
        permissions: this.getAdminPermissions(),
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'hr.admin@pms.com',
        password: defaultPassword,
        firstName: 'HR',
        lastName: 'Administrator',
        role: UserRole.HR_MANAGER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        isActive: true,
        permissions: this.getHRPermissions(),
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Project managers
      {
        email: 'pm1@pms.com',
        password: defaultPassword,
        firstName: 'John',
        lastName: 'Manager',
        role: UserRole.PROJECT_MANAGER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        isActive: true,
        permissions: this.getProjectManagerPermissions(),
        lastLoginAt: this.randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        email: 'pm2@pms.com',
        password: defaultPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: UserRole.PROJECT_MANAGER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        isActive: true,
        permissions: this.getProjectManagerPermissions(),
        lastLoginAt: this.randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      // Team leads
      {
        email: 'tl1@pms.com',
        password: defaultPassword,
        firstName: 'Mike',
        lastName: 'Wilson',
        role: UserRole.TEAM_LEAD,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        isActive: true,
        permissions: this.getTeamLeadPermissions(),
        lastLoginAt: this.randomDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), new Date()),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        email: 'tl2@pms.com',
        password: defaultPassword,
        firstName: 'Emily',
        lastName: 'Davis',
        role: UserRole.TEAM_LEAD,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        isActive: true,
        permissions: this.getTeamLeadPermissions(),
        lastLoginAt: this.randomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), new Date()),
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    // Generate regular employees
    const employeeNames = [
      { firstName: 'Alice', lastName: 'Brown' },
      { firstName: 'Bob', lastName: 'Smith' },
      { firstName: 'Carol', lastName: 'Jones' },
      { firstName: 'David', lastName: 'Miller' },
      { firstName: 'Eva', lastName: 'Garcia' },
      { firstName: 'Frank', lastName: 'Rodriguez' },
      { firstName: 'Grace', lastName: 'Martinez' },
      { firstName: 'Henry', lastName: 'Anderson' },
      { firstName: 'Ivy', lastName: 'Taylor' },
      { firstName: 'Jack', lastName: 'Thomas' },
      { firstName: 'Kate', lastName: 'Jackson' },
      { firstName: 'Leo', lastName: 'White' },
      { firstName: 'Mia', lastName: 'Harris' },
      { firstName: 'Noah', lastName: 'Clark' },
      { firstName: 'Olivia', lastName: 'Lewis' },
    ];

    for (const name of employeeNames) {
      const email = `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@pms.com`;
      const createdDaysAgo = this.randomNumber(1, 60);
      const lastLoginDaysAgo = this.randomNumber(0, 7);
      
      users.push({
        email,
        password: defaultPassword,
        firstName: name.firstName,
        lastName: name.lastName,
        role: UserRole.EMPLOYEE,
        status: this.randomBoolean(0.95) ? UserStatus.ACTIVE : UserStatus.INACTIVE,
        emailVerifiedAt: this.randomBoolean(0.9) ? new Date() : null,
        isActive: this.randomBoolean(0.95),
        permissions: this.getEmployeePermissions(),
        lastLoginAt: lastLoginDaysAgo === 0 ? new Date() : 
          new Date(Date.now() - lastLoginDaysAgo * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      });
    }

    return users;
  }
}
