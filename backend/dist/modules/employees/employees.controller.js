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
exports.EmployeesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const employees_service_1 = require("./employees.service");
const employee_dto_1 = require("./dto/employee.dto");
const user_schema_1 = require("../../shared/database/schemas/user.schema");
const employee_schema_1 = require("../../shared/database/schemas/employee.schema");
const files_service_1 = require("../files/files.service");
let EmployeesController = class EmployeesController {
    constructor(employeesService, filesService) {
        this.employeesService = employeesService;
        this.filesService = filesService;
    }
    async create(createEmployeeDto, currentUser) {
        return this.employeesService.create(createEmployeeDto, currentUser.id);
    }
    async findAll(query) {
        return this.employeesService.findAll(query);
    }
    async getEmployeeStats() {
        return this.employeesService.getEmployeeStats();
    }
    async getDepartmentStats() {
        return this.employeesService.getDepartmentStats();
    }
    async searchBySkills(skills, query) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        return this.employeesService.searchBySkills(skillsArray, query);
    }
    async findByUserId(userId) {
        return this.employeesService.findByUserId(userId);
    }
    async findByEmployeeId(employeeId) {
        return this.employeesService.findByEmployeeId(employeeId);
    }
    async findById(id) {
        return this.employeesService.findById(id);
    }
    async update(id, updateEmployeeDto, currentUser) {
        return this.employeesService.update(id, updateEmployeeDto, currentUser.id);
    }
    async updateEmploymentStatus(id, status, currentUser) {
        return this.employeesService.updateEmploymentStatus(id, status, currentUser.id);
    }
    async uploadProfileImage(id, file, currentUser) {
        const uploadResult = await this.filesService.uploadFile(file, `employees/${id}/profile`, currentUser.id);
        await this.employeesService.update(id, { metadata: { profileImageUrl: uploadResult.url } }, currentUser.id);
        return {
            message: 'Profile image uploaded successfully',
            url: uploadResult.url,
            fileId: uploadResult.id,
        };
    }
    async addSkill(id, skill, currentUser) {
        return this.employeesService.addSkill(id, skill, currentUser.id);
    }
    async removeSkill(id, skillName, currentUser) {
        return this.employeesService.removeSkill(id, skillName, currentUser.id);
    }
    async addWorkExperience(id, experience, currentUser) {
        return this.employeesService.addWorkExperience(id, experience, currentUser.id);
    }
    async addEducation(id, education, currentUser) {
        return this.employeesService.addEducation(id, education, currentUser.id);
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new employee profile' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Employee profile created successfully',
        type: employee_dto_1.EmployeeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Employee profile already exists or employee ID is taken',
    }),
    openapi.ApiResponse({ status: 201, type: require("./dto/employee.dto").EmployeeResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_dto_1.CreateEmployeeDto, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.HR_MANAGER, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all employees with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Employees retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                employees: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/EmployeeResponseDto' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_dto_1.EmployeeQueryDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee statistics' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Employee statistics retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getEmployeeStats", null);
__decorate([
    (0, common_1.Get)('departments/stats'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get department statistics' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Department statistics retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getDepartmentStats", null);
__decorate([
    (0, common_1.Get)('search/skills'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.HR_MANAGER, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Search employees by skills' }),
    (0, swagger_1.ApiQuery)({ name: 'skills', type: [String], description: 'Array of skill names' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Employees with specified skills retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('skills')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, employee_dto_1.EmployeeQueryDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "searchBySkills", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee profile by user ID' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Employee profile retrieved successfully',
        type: employee_dto_1.EmployeeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Employee profile not found',
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/employee.dto").EmployeeResponseDto }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Get)('employee-id/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee by employee ID' }),
    (0, swagger_1.ApiParam)({ name: 'employeeId', description: 'Employee ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Employee retrieved successfully',
        type: employee_dto_1.EmployeeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Employee not found',
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/employee.dto").EmployeeResponseDto }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findByEmployeeId", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Employee ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Employee retrieved successfully',
        type: employee_dto_1.EmployeeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Employee not found',
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/employee.dto").EmployeeResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update employee profile' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Employee ID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Employee updated successfully',
        type: employee_dto_1.EmployeeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Employee not found',
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/employee.dto").EmployeeResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, employee_dto_1.UpdateEmployeeDto, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/employment-status'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update employee employment status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Employee ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: { enum: Object.values(employee_schema_1.EmploymentStatus) },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Employment status updated successfully',
        type: employee_dto_1.EmployeeResponseDto,
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/employee.dto").EmployeeResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "updateEmploymentStatus", null);
__decorate([
    (0, common_1.Post)(':id/profile-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload employee profile image' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Employee ID' }),
    (0, swagger_1.ApiBody)({
        description: 'Profile image file',
        type: 'multipart/form-data',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Profile image uploaded successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .addFileTypeValidator({
        fileType: /(jpg|jpeg|png|gif)$/,
    })
        .addMaxSizeValidator({
        maxSize: 5 * 1024 * 1024,
    })
        .build({
        errorHttpStatusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
    }))),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "uploadProfileImage", null);
__decorate([
    (0, common_1.Post)(':id/skills'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Add skill to employee' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Employee ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
                yearsOfExperience: { type: 'number' },
                certifications: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Skill added successfully',
        type: employee_dto_1.EmployeeResponseDto,
    }),
    openapi.ApiResponse({ status: 201, type: require("./dto/employee.dto").EmployeeResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "addSkill", null);
__decorate([
    (0, common_1.Delete)(':id/skills/:skillName'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Remove skill from employee' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Employee ID' }),
    (0, swagger_1.ApiParam)({ name: 'skillName', description: 'Skill name to remove' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Skill removed successfully',
        type: employee_dto_1.EmployeeResponseDto,
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/employee.dto").EmployeeResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('skillName')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "removeSkill", null);
__decorate([
    (0, common_1.Post)(':id/work-experience'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Add work experience to employee' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Employee ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                company: { type: 'string' },
                position: { type: 'string' },
                startDate: { type: 'string', format: 'date' },
                endDate: { type: 'string', format: 'date' },
                description: { type: 'string' },
                technologies: { type: 'array', items: { type: 'string' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Work experience added successfully',
        type: employee_dto_1.EmployeeResponseDto,
    }),
    openapi.ApiResponse({ status: 201, type: require("./dto/employee.dto").EmployeeResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "addWorkExperience", null);
__decorate([
    (0, common_1.Post)(':id/education'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Add education to employee' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Employee ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                institution: { type: 'string' },
                degree: { type: 'string' },
                fieldOfStudy: { type: 'string' },
                startDate: { type: 'string', format: 'date' },
                endDate: { type: 'string', format: 'date' },
                gpa: { type: 'number' },
                description: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Education added successfully',
        type: employee_dto_1.EmployeeResponseDto,
    }),
    openapi.ApiResponse({ status: 201, type: require("./dto/employee.dto").EmployeeResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "addEducation", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, swagger_1.ApiTags)('employees'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService,
        files_service_1.FilesService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map