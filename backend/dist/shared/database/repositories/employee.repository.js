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
exports.EmployeeRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_repository_1 = require("./base.repository");
const employee_schema_1 = require("../schemas/employee.schema");
let EmployeeRepository = class EmployeeRepository extends base_repository_1.BaseRepository {
    constructor(employeeModel) {
        super(employeeModel);
        this.employeeModel = employeeModel;
    }
    async findByUserId(userId) {
        return this.employeeModel.findOne({ userId }).populate('userId managerId').exec();
    }
    async findByUserIdWithPopulation(userId) {
        return this.employeeModel
            .findOne({ userId })
            .populate({
            path: 'userId',
            select: 'email firstName lastName profileImage',
        })
            .populate({
            path: 'managerId',
            select: 'employeeId userId',
            populate: {
                path: 'userId',
                select: 'firstName lastName',
            },
        })
            .exec();
    }
    async findByEmployeeId(employeeId) {
        return this.employeeModel.findOne({ employeeId }).populate('userId managerId').exec();
    }
    async findByEmployeeIdWithPopulation(employeeId) {
        return this.employeeModel
            .findOne({ employeeId })
            .populate({
            path: 'userId',
            select: 'email firstName lastName profileImage',
        })
            .populate({
            path: 'managerId',
            select: 'employeeId userId',
            populate: {
                path: 'userId',
                select: 'firstName lastName',
            },
        })
            .exec();
    }
    async findByIdWithPopulation(id) {
        return this.employeeModel
            .findById(id)
            .populate({
            path: 'userId',
            select: 'email firstName lastName profileImage',
        })
            .populate({
            path: 'managerId',
            select: 'employeeId userId',
            populate: {
                path: 'userId',
                select: 'firstName lastName',
            },
        })
            .exec();
    }
    async searchEmployees(options) {
        const { department, position, employmentType, employmentStatus, managerId, skills, searchTerm, salaryRange, page = 1, limit = 10, sort = { createdAt: -1 }, } = options;
        const filter = {};
        if (department) {
            filter.department = { $regex: department, $options: 'i' };
        }
        if (position) {
            filter.position = { $regex: position, $options: 'i' };
        }
        if (employmentType) {
            filter.employmentType = employmentType;
        }
        if (employmentStatus) {
            filter.employmentStatus = employmentStatus;
        }
        if (managerId) {
            filter.managerId = managerId;
        }
        if (skills && skills.length > 0) {
            filter['skills.name'] = { $in: skills };
        }
        if (salaryRange) {
            filter.salary = {};
            if (salaryRange.min !== undefined) {
                filter.salary.$gte = salaryRange.min;
            }
            if (salaryRange.max !== undefined) {
                filter.salary.$lte = salaryRange.max;
            }
        }
        if (searchTerm) {
            filter.$or = [
                { employeeId: { $regex: searchTerm, $options: 'i' } },
                { department: { $regex: searchTerm, $options: 'i' } },
                { position: { $regex: searchTerm, $options: 'i' } },
                { 'skills.name': { $regex: searchTerm, $options: 'i' } },
            ];
        }
        const result = await this.findWithPagination(filter, { page, limit, sort });
        await this.employeeModel.populate(result.data, { path: 'userId managerId' });
        return result;
    }
    async findByDepartment(department) {
        return this.employeeModel.find({
            department: { $regex: department, $options: 'i' },
            employmentStatus: employee_schema_1.EmploymentStatus.ACTIVE,
        }).populate('userId managerId').exec();
    }
    async findByManager(managerId) {
        return this.employeeModel.find({
            managerId,
            employmentStatus: employee_schema_1.EmploymentStatus.ACTIVE,
        }).populate('userId managerId').exec();
    }
    async findBySkills(skills) {
        return this.employeeModel.find({
            'skills.name': { $in: skills },
            employmentStatus: employee_schema_1.EmploymentStatus.ACTIVE,
        }).populate('userId').exec();
    }
    async findBySkillLevel(skill, level) {
        return this.employeeModel.find({
            skills: {
                $elemMatch: {
                    name: { $regex: skill, $options: 'i' },
                    level: level,
                },
            },
            employmentStatus: employee_schema_1.EmploymentStatus.ACTIVE,
        }).populate('userId').exec();
    }
    async findActiveEmployees() {
        return this.employeeModel.find({
            employmentStatus: employee_schema_1.EmploymentStatus.ACTIVE,
        }).populate('userId managerId').exec();
    }
    async findEmployeesHiredInRange(startDate, endDate) {
        return this.employeeModel.find({
            hireDate: { $gte: startDate, $lte: endDate },
        }).populate('userId').exec();
    }
    async updateSkills(employeeId, skills) {
        return this.employeeModel.findByIdAndUpdate(employeeId, { skills }, { new: true }).populate('userId').exec();
    }
    async updateSalary(employeeId, salary, currency) {
        const updateData = { salary };
        if (currency) {
            updateData.currency = currency;
        }
        return this.employeeModel.findByIdAndUpdate(employeeId, updateData, { new: true }).populate('userId').exec();
    }
    async updateManager(employeeId, managerId) {
        return this.employeeModel.findByIdAndUpdate(employeeId, { managerId }, { new: true }).populate('userId managerId').exec();
    }
    async updateEmploymentStatus(employeeId, status, terminationDate) {
        const updateData = { employmentStatus: status };
        if (status === employee_schema_1.EmploymentStatus.TERMINATED && terminationDate) {
            updateData.terminationDate = terminationDate;
        }
        return this.employeeModel.findByIdAndUpdate(employeeId, updateData, { new: true }).populate('userId').exec();
    }
    async getEmployeeStats() {
        const [total, active, departmentStats, typeStats, salaryStats,] = await Promise.all([
            this.count(),
            this.count({ employmentStatus: employee_schema_1.EmploymentStatus.ACTIVE }),
            this.employeeModel.aggregate([
                { $group: { _id: '$department', count: { $sum: 1 } } },
            ]).exec(),
            this.employeeModel.aggregate([
                { $group: { _id: '$employmentType', count: { $sum: 1 } } },
            ]).exec(),
            this.employeeModel.aggregate([
                {
                    $match: { employmentStatus: employee_schema_1.EmploymentStatus.ACTIVE },
                },
                {
                    $group: {
                        _id: null,
                        averageSalary: { $avg: '$salary' },
                        totalSalary: { $sum: '$salary' },
                    },
                },
            ]).exec(),
        ]);
        const byDepartment = {};
        departmentStats.forEach(stat => {
            byDepartment[stat._id] = stat.count;
        });
        const byEmploymentType = Object.values(employee_schema_1.EmploymentType).reduce((acc, type) => {
            acc[type] = 0;
            return acc;
        }, {});
        typeStats.forEach(stat => {
            byEmploymentType[stat._id] = stat.count;
        });
        const averageSalary = salaryStats[0]?.averageSalary || 0;
        const totalSalaryExpense = salaryStats[0]?.totalSalary || 0;
        return {
            total,
            active,
            byDepartment,
            byEmploymentType,
            averageSalary,
            totalSalaryExpense,
        };
    }
    async getDepartmentStats() {
        return this.employeeModel.aggregate([
            {
                $match: {
                    employmentStatus: { $ne: employee_schema_1.EmploymentStatus.TERMINATED },
                },
            },
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                    averageSalary: { $avg: '$salary' },
                    totalSalary: { $sum: '$salary' },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
    }
    async addSkill(employeeId, skill, updatedBy) {
        return this.employeeModel
            .findByIdAndUpdate(employeeId, {
            $push: { skills: skill },
            updatedBy: new mongoose_2.Types.ObjectId(updatedBy),
        }, { new: true })
            .exec();
    }
    async removeSkill(employeeId, skillName, updatedBy) {
        return this.employeeModel
            .findByIdAndUpdate(employeeId, {
            $pull: { skills: { name: skillName } },
            updatedBy: new mongoose_2.Types.ObjectId(updatedBy),
        }, { new: true })
            .exec();
    }
    async addWorkExperience(employeeId, experience, updatedBy) {
        return this.employeeModel
            .findByIdAndUpdate(employeeId, {
            $push: { workExperience: experience },
            updatedBy: new mongoose_2.Types.ObjectId(updatedBy),
        }, { new: true })
            .exec();
    }
    async addEducation(employeeId, education, updatedBy) {
        return this.employeeModel
            .findByIdAndUpdate(employeeId, {
            $push: { education: education },
            updatedBy: new mongoose_2.Types.ObjectId(updatedBy),
        }, { new: true })
            .exec();
    }
    async findUpcomingAnniversaries(days = 30) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        return this.employeeModel.aggregate([
            {
                $match: {
                    employmentStatus: employee_schema_1.EmploymentStatus.ACTIVE,
                },
            },
            {
                $addFields: {
                    anniversaryThisYear: {
                        $dateFromParts: {
                            year: today.getFullYear(),
                            month: { $month: '$hireDate' },
                            day: { $dayOfMonth: '$hireDate' },
                        },
                    },
                },
            },
            {
                $match: {
                    anniversaryThisYear: {
                        $gte: today,
                        $lte: futureDate,
                    },
                },
            },
            {
                $sort: { anniversaryThisYear: 1 },
            },
        ]).exec();
    }
    async getSkillsDistribution() {
        return this.employeeModel.aggregate([
            { $match: { employmentStatus: employee_schema_1.EmploymentStatus.ACTIVE } },
            { $unwind: '$skills' },
            {
                $group: {
                    _id: '$skills.name',
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    skill: '$_id',
                    count: 1,
                    _id: 0,
                },
            },
            { $sort: { count: -1 } },
        ]).exec();
    }
};
exports.EmployeeRepository = EmployeeRepository;
exports.EmployeeRepository = EmployeeRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EmployeeRepository);
//# sourceMappingURL=employee.repository.js.map