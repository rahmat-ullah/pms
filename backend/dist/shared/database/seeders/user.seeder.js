"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSeeder = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const argon2 = require("argon2");
const user_schema_1 = require("../schemas/user.schema");
const user_schema_2 = require("../schemas/user.schema");
const base_seeder_1 = require("./base.seeder");
let UserSeeder = class UserSeeder extends base_seeder_1.BaseSeeder {
    constructor(userModel) {
        super(userModel);
    }
    getCollectionName() {
        return 'users';
    }
    getAdminPermissions() {
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
    getHRPermissions() {
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
    getProjectManagerPermissions() {
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
    getTeamLeadPermissions() {
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
    getEmployeePermissions() {
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
    async getData() {
        const defaultPassword = await argon2.hash('password123');
        const users = [
            {
                email: 'admin@pms.com',
                password: defaultPassword,
                firstName: 'System',
                lastName: 'Administrator',
                role: user_schema_2.UserRole.SUPER_ADMIN,
                status: user_schema_2.UserStatus.ACTIVE,
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
                role: user_schema_2.UserRole.HR_MANAGER,
                status: user_schema_2.UserStatus.ACTIVE,
                emailVerifiedAt: new Date(),
                isActive: true,
                permissions: this.getHRPermissions(),
                lastLoginAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'pm1@pms.com',
                password: defaultPassword,
                firstName: 'John',
                lastName: 'Manager',
                role: user_schema_2.UserRole.PROJECT_MANAGER,
                status: user_schema_2.UserStatus.ACTIVE,
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
                role: user_schema_2.UserRole.PROJECT_MANAGER,
                status: user_schema_2.UserStatus.ACTIVE,
                emailVerifiedAt: new Date(),
                isActive: true,
                permissions: this.getProjectManagerPermissions(),
                lastLoginAt: this.randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
                createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(),
            },
            {
                email: 'tl1@pms.com',
                password: defaultPassword,
                firstName: 'Mike',
                lastName: 'Wilson',
                role: user_schema_2.UserRole.TEAM_LEAD,
                status: user_schema_2.UserStatus.ACTIVE,
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
                role: user_schema_2.UserRole.TEAM_LEAD,
                status: user_schema_2.UserStatus.ACTIVE,
                emailVerifiedAt: new Date(),
                isActive: true,
                permissions: this.getTeamLeadPermissions(),
                lastLoginAt: this.randomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), new Date()),
                createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(),
            },
        ];
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
                role: user_schema_2.UserRole.EMPLOYEE,
                status: this.randomBoolean(0.95) ? user_schema_2.UserStatus.ACTIVE : user_schema_2.UserStatus.INACTIVE,
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
};
exports.UserSeeder = UserSeeder;
exports.UserSeeder = UserSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserSeeder);
//# sourceMappingURL=user.seeder.js.map