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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const employee_repository_1 = require("../../shared/database/repositories/employee.repository");
const user_repository_1 = require("../../shared/database/repositories/user.repository");
const employee_schema_1 = require("../../shared/database/schemas/employee.schema");
const user_schema_1 = require("../../shared/database/schemas/user.schema");
let EmployeesService = class EmployeesService {
    constructor(employeeRepository, userRepository) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }
    async create(createEmployeeDto, currentUserId) {
        const user = await this.userRepository.findById(createEmployeeDto.userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingEmployee = await this.employeeRepository.findByUserId(createEmployeeDto.userId);
        if (existingEmployee) {
            throw new common_1.ConflictException('Employee profile already exists for this user');
        }
        const existingEmployeeId = await this.employeeRepository.findByEmployeeId(createEmployeeDto.employeeId);
        if (existingEmployeeId) {
            throw new common_1.ConflictException('Employee ID already exists');
        }
        if (createEmployeeDto.managerId) {
            const manager = await this.employeeRepository.findById(createEmployeeDto.managerId);
            if (!manager) {
                throw new common_1.NotFoundException('Manager not found');
            }
        }
        const employeeData = {
            ...createEmployeeDto,
            userId: new mongoose_1.Types.ObjectId(createEmployeeDto.userId),
            managerId: createEmployeeDto.managerId ? new mongoose_1.Types.ObjectId(createEmployeeDto.managerId) : undefined,
            hireDate: new Date(createEmployeeDto.hireDate),
            dateOfBirth: createEmployeeDto.dateOfBirth ? new Date(createEmployeeDto.dateOfBirth) : undefined,
            createdBy: new mongoose_1.Types.ObjectId(currentUserId),
            updatedBy: new mongoose_1.Types.ObjectId(currentUserId),
        };
        const employee = await this.employeeRepository.create(employeeData);
        await this.userRepository.update(createEmployeeDto.userId, {
            employeeProfile: employee._id,
            role: user_schema_1.UserRole.EMPLOYEE,
            updatedBy: new mongoose_1.Types.ObjectId(currentUserId),
        });
        return this.mapToResponseDto(employee);
    }
    async findAll(query) {
        const filter = this.buildSearchFilter(query);
        const result = await this.employeeRepository.findWithPagination(filter, {
            page: query.page,
            limit: query.limit,
            sort: { [query.sortBy]: query.sortOrder === 'desc' ? -1 : 1 },
        });
        const employees = result.data;
        const total = result.total;
        const totalPages = Math.ceil(total / query.limit);
        return {
            employees: employees.map(employee => this.mapToResponseDto(employee)),
            total,
            page: query.page,
            limit: query.limit,
            totalPages,
        };
    }
    async findById(id) {
        const employee = await this.employeeRepository.findByIdWithPopulation(id);
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        return this.mapToResponseDto(employee);
    }
    async findByUserId(userId) {
        const employee = await this.employeeRepository.findByUserIdWithPopulation(userId);
        if (!employee) {
            throw new common_1.NotFoundException('Employee profile not found for this user');
        }
        return this.mapToResponseDto(employee);
    }
    async findByEmployeeId(employeeId) {
        const employee = await this.employeeRepository.findByEmployeeIdWithPopulation(employeeId);
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        return this.mapToResponseDto(employee);
    }
    async update(id, updateEmployeeDto, currentUserId) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        if (updateEmployeeDto.employeeId && updateEmployeeDto.employeeId !== employee.employeeId) {
            const existingEmployeeId = await this.employeeRepository.findByEmployeeId(updateEmployeeDto.employeeId);
            if (existingEmployeeId) {
                throw new common_1.ConflictException('Employee ID already exists');
            }
        }
        if (updateEmployeeDto.managerId) {
            const manager = await this.employeeRepository.findById(updateEmployeeDto.managerId);
            if (!manager) {
                throw new common_1.NotFoundException('Manager not found');
            }
        }
        const updateData = {
            ...updateEmployeeDto,
            managerId: updateEmployeeDto.managerId ? new mongoose_1.Types.ObjectId(updateEmployeeDto.managerId) : undefined,
            hireDate: updateEmployeeDto.hireDate ? new Date(updateEmployeeDto.hireDate) : undefined,
            terminationDate: updateEmployeeDto.terminationDate ? new Date(updateEmployeeDto.terminationDate) : undefined,
            dateOfBirth: updateEmployeeDto.dateOfBirth ? new Date(updateEmployeeDto.dateOfBirth) : undefined,
            updatedBy: new mongoose_1.Types.ObjectId(currentUserId),
        };
        const updatedEmployee = await this.employeeRepository.update(id, updateData);
        return this.mapToResponseDto(updatedEmployee);
    }
    async updateEmploymentStatus(id, status, currentUserId) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const updateData = {
            employmentStatus: status,
            updatedBy: new mongoose_1.Types.ObjectId(currentUserId),
        };
        if (status === employee_schema_1.EmploymentStatus.TERMINATED) {
            updateData.terminationDate = new Date();
        }
        const updatedEmployee = await this.employeeRepository.update(id, updateData);
        return this.mapToResponseDto(updatedEmployee);
    }
    async addSkill(id, skill, currentUserId) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const updatedEmployee = await this.employeeRepository.addSkill(id, skill, currentUserId);
        return this.mapToResponseDto(updatedEmployee);
    }
    async removeSkill(id, skillName, currentUserId) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const updatedEmployee = await this.employeeRepository.removeSkill(id, skillName, currentUserId);
        return this.mapToResponseDto(updatedEmployee);
    }
    async addWorkExperience(id, experience, currentUserId) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const updatedEmployee = await this.employeeRepository.addWorkExperience(id, experience, currentUserId);
        return this.mapToResponseDto(updatedEmployee);
    }
    async addEducation(id, education, currentUserId) {
        const employee = await this.employeeRepository.findById(id);
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const updatedEmployee = await this.employeeRepository.addEducation(id, education, currentUserId);
        return this.mapToResponseDto(updatedEmployee);
    }
    async searchBySkills(skills, query) {
        const searchFilter = {
            ...this.buildSearchFilter(query),
            'skills.name': { $in: skills },
        };
        const result = await this.employeeRepository.findWithPagination(searchFilter, {
            page: query.page,
            limit: query.limit,
            sort: { [query.sortBy]: query.sortOrder === 'desc' ? -1 : 1 },
        });
        const employees = result.data;
        const total = result.total;
        const totalPages = Math.ceil(total / query.limit);
        return {
            employees: employees.map(employee => this.mapToResponseDto(employee)),
            total,
            page: query.page,
            limit: query.limit,
            totalPages,
        };
    }
    async getEmployeeStats() {
        return this.employeeRepository.getEmployeeStats();
    }
    async getDepartmentStats() {
        return this.employeeRepository.getDepartmentStats();
    }
    buildSearchFilter(query) {
        const filter = {};
        if (!query.includeTerminated) {
            filter.employmentStatus = { $ne: employee_schema_1.EmploymentStatus.TERMINATED };
        }
        if (query.search) {
            filter.$or = [
                { employeeId: { $regex: query.search, $options: 'i' } },
                { department: { $regex: query.search, $options: 'i' } },
                { position: { $regex: query.search, $options: 'i' } },
            ];
        }
        if (query.department) {
            filter.department = { $regex: query.department, $options: 'i' };
        }
        if (query.position) {
            filter.position = { $regex: query.position, $options: 'i' };
        }
        if (query.employmentType) {
            filter.employmentType = query.employmentType;
        }
        if (query.employmentStatus) {
            filter.employmentStatus = query.employmentStatus;
        }
        if (query.managerId) {
            filter.managerId = new mongoose_1.Types.ObjectId(query.managerId);
        }
        if (query.skills && query.skills.length > 0) {
            filter['skills.name'] = { $in: query.skills };
        }
        return filter;
    }
    mapToResponseDto(employee) {
        return {
            id: employee._id?.toString() || employee.id,
            userId: employee.userId?.toString(),
            employeeId: employee.employeeId,
            department: employee.department,
            position: employee.position,
            employmentType: employee.employmentType,
            employmentStatus: employee.employmentStatus,
            hireDate: employee.hireDate,
            terminationDate: employee.terminationDate,
            managerId: employee.managerId?.toString(),
            salary: employee.salary,
            currency: employee.currency,
            salaryType: employee.salaryType,
            dateOfBirth: employee.dateOfBirth,
            gender: employee.gender,
            nationality: employee.nationality,
            address: employee.address,
            emergencyContacts: employee.emergencyContacts,
            skills: employee.skills,
            workExperience: employee.workExperience,
            education: employee.education,
            certifications: employee.certifications,
            languages: employee.languages,
            bio: employee.bio,
            linkedinProfile: employee.linkedinProfile,
            githubProfile: employee.githubProfile,
            weeklyWorkingHours: employee.weeklyWorkingHours,
            timezone: employee.timezone,
            preferences: employee.preferences,
            metadata: employee.metadata,
            createdBy: employee.createdBy?.toString(),
            updatedBy: employee.updatedBy?.toString(),
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt,
            user: employee.userId && typeof employee.userId === 'object' ? {
                id: employee.userId._id?.toString(),
                email: employee.userId.email,
                firstName: employee.userId.firstName,
                lastName: employee.userId.lastName,
                fullName: employee.userId.fullName,
                profileImage: employee.userId.profileImage,
            } : undefined,
            manager: employee.managerId && typeof employee.managerId === 'object' ? {
                id: employee.managerId._id?.toString(),
                employeeId: employee.managerId.employeeId,
                user: {
                    firstName: employee.managerId.userId?.firstName,
                    lastName: employee.managerId.userId?.lastName,
                    fullName: employee.managerId.userId?.fullName,
                },
            } : undefined,
        };
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [employee_repository_1.EmployeeRepository,
        user_repository_1.UserRepository])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map