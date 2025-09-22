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
exports.EmployeeResponseDto = exports.EmployeeQueryDto = exports.UpdateEmployeeDto = exports.CreateEmployeeDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const employee_schema_1 = require("../../../shared/database/schemas/employee.schema");
class CreateEmployeeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => String }, employeeId: { required: true, type: () => String }, department: { required: true, type: () => String }, position: { required: true, type: () => String }, employmentType: { required: true, enum: require("../../../shared/database/schemas/employee.schema").EmploymentType }, employmentStatus: { required: false, enum: require("../../../shared/database/schemas/employee.schema").EmploymentStatus }, hireDate: { required: true, type: () => String }, managerId: { required: false, type: () => String }, salary: { required: true, type: () => Number, minimum: 0 }, currency: { required: false, type: () => String }, salaryType: { required: false, type: () => String }, dateOfBirth: { required: false, type: () => String }, gender: { required: false, type: () => String }, nationality: { required: false, type: () => String }, address: { required: false, type: () => Object }, emergencyContacts: { required: false, type: () => [Object] }, skills: { required: false, type: () => [Object] }, workExperience: { required: false, type: () => [Object] }, education: { required: false, type: () => [Object] }, certifications: { required: false, type: () => [String] }, languages: { required: false, type: () => [String] }, bio: { required: false, type: () => String }, linkedinProfile: { required: false, type: () => String }, githubProfile: { required: false, type: () => String }, weeklyWorkingHours: { required: false, type: () => Number, minimum: 1, maximum: 80 }, timezone: { required: false, type: () => String }, preferences: { required: false, type: () => Object }, metadata: { required: false, type: () => Object } };
    }
}
exports.CreateEmployeeDto = CreateEmployeeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Engineering' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Senior Software Engineer' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: employee_schema_1.EmploymentType }),
    (0, class_validator_1.IsEnum)(employee_schema_1.EmploymentType),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "employmentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: employee_schema_1.EmploymentStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(employee_schema_1.EmploymentStatus),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-15T00:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "hireDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439011' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "managerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "salary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'USD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'yearly' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['hourly', 'monthly', 'yearly']),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "salaryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1990-05-15T00:00:00.000Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'male' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['male', 'female', 'other', 'prefer_not_to_say']),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'American' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "nationality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateEmployeeDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateEmployeeDto.prototype, "emergencyContacts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateEmployeeDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateEmployeeDto.prototype, "workExperience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateEmployeeDto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateEmployeeDto.prototype, "certifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateEmployeeDto.prototype, "languages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Experienced software engineer with expertise in full-stack development.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://linkedin.com/in/johndoe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "linkedinProfile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://github.com/johndoe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "githubProfile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 40 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(80),
    __metadata("design:type", Number)
], CreateEmployeeDto.prototype, "weeklyWorkingHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'America/New_York' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateEmployeeDto.prototype, "preferences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateEmployeeDto.prototype, "metadata", void 0);
class UpdateEmployeeDto extends (0, swagger_1.PartialType)(CreateEmployeeDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return { terminationDate: { required: false, type: () => String } };
    }
}
exports.UpdateEmployeeDto = UpdateEmployeeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2023-12-31T00:00:00.000Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "terminationDate", void 0);
class EmployeeQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'hireDate';
        this.sortOrder = 'desc';
        this.includeTerminated = false;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: false, type: () => Number, default: 1 }, limit: { required: false, type: () => Number, default: 10 }, search: { required: false, type: () => String }, department: { required: false, type: () => String }, position: { required: false, type: () => String }, employmentType: { required: false, enum: require("../../../shared/database/schemas/employee.schema").EmploymentType }, employmentStatus: { required: false, enum: require("../../../shared/database/schemas/employee.schema").EmploymentStatus }, managerId: { required: false, type: () => String }, skills: { required: false, type: () => [String] }, sortBy: { required: false, type: () => String, default: "hireDate" }, sortOrder: { required: false, type: () => Object, default: "desc" }, includeTerminated: { required: false, type: () => Boolean, default: false } };
    }
}
exports.EmployeeQueryDto = EmployeeQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EmployeeQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EmployeeQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmployeeQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Engineering' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmployeeQueryDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Senior Software Engineer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmployeeQueryDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: employee_schema_1.EmploymentType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(employee_schema_1.EmploymentType),
    __metadata("design:type", String)
], EmployeeQueryDto.prototype, "employmentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: employee_schema_1.EmploymentStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(employee_schema_1.EmploymentStatus),
    __metadata("design:type", String)
], EmployeeQueryDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439011' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmployeeQueryDto.prototype, "managerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], EmployeeQueryDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'hireDate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmployeeQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'desc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmployeeQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EmployeeQueryDto.prototype, "includeTerminated", void 0);
class EmployeeResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, userId: { required: true, type: () => String }, employeeId: { required: true, type: () => String }, department: { required: true, type: () => String }, position: { required: true, type: () => String }, employmentType: { required: true, enum: require("../../../shared/database/schemas/employee.schema").EmploymentType }, employmentStatus: { required: true, enum: require("../../../shared/database/schemas/employee.schema").EmploymentStatus }, hireDate: { required: true, type: () => Date }, terminationDate: { required: false, type: () => Date }, managerId: { required: false, type: () => String }, salary: { required: true, type: () => Number }, currency: { required: true, type: () => String }, salaryType: { required: true, type: () => String }, dateOfBirth: { required: false, type: () => Date }, gender: { required: false, type: () => String }, nationality: { required: false, type: () => String }, address: { required: false, type: () => Object }, emergencyContacts: { required: false, type: () => [Object] }, skills: { required: false, type: () => [Object] }, workExperience: { required: false, type: () => [Object] }, education: { required: false, type: () => [Object] }, certifications: { required: false, type: () => [String] }, languages: { required: false, type: () => [String] }, bio: { required: false, type: () => String }, linkedinProfile: { required: false, type: () => String }, githubProfile: { required: false, type: () => String }, weeklyWorkingHours: { required: true, type: () => Number }, timezone: { required: true, type: () => String }, preferences: { required: false, type: () => Object }, metadata: { required: false, type: () => Object }, createdBy: { required: false, type: () => String }, updatedBy: { required: false, type: () => String }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, user: { required: false, type: () => ({ id: { required: true, type: () => String }, email: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, fullName: { required: true, type: () => String }, profileImage: { required: false, type: () => String } }) }, manager: { required: false, type: () => ({ id: { required: true, type: () => String }, employeeId: { required: true, type: () => String }, user: { required: true, type: () => ({ firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, fullName: { required: true, type: () => String } }) } }) } };
    }
}
exports.EmployeeResponseDto = EmployeeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP001' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Engineering' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Senior Software Engineer' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: employee_schema_1.EmploymentType }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "employmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: employee_schema_1.EmploymentStatus }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-15T00:00:00.000Z' }),
    __metadata("design:type", Date)
], EmployeeResponseDto.prototype, "hireDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2023-12-31T00:00:00.000Z' }),
    __metadata("design:type", Date)
], EmployeeResponseDto.prototype, "terminationDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "managerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75000 }),
    __metadata("design:type", Number)
], EmployeeResponseDto.prototype, "salary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'yearly' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "salaryType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1990-05-15T00:00:00.000Z' }),
    __metadata("design:type", Date)
], EmployeeResponseDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'male' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'American' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "nationality", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], EmployeeResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    __metadata("design:type", Array)
], EmployeeResponseDto.prototype, "emergencyContacts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    __metadata("design:type", Array)
], EmployeeResponseDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    __metadata("design:type", Array)
], EmployeeResponseDto.prototype, "workExperience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    __metadata("design:type", Array)
], EmployeeResponseDto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    __metadata("design:type", Array)
], EmployeeResponseDto.prototype, "certifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    __metadata("design:type", Array)
], EmployeeResponseDto.prototype, "languages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Experienced software engineer...' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://linkedin.com/in/johndoe' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "linkedinProfile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://github.com/johndoe' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "githubProfile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 40 }),
    __metadata("design:type", Number)
], EmployeeResponseDto.prototype, "weeklyWorkingHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'America/New_York' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], EmployeeResponseDto.prototype, "preferences", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], EmployeeResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "updatedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-15T00:00:00.000Z' }),
    __metadata("design:type", Date)
], EmployeeResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-15T00:00:00.000Z' }),
    __metadata("design:type", Date)
], EmployeeResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], EmployeeResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], EmployeeResponseDto.prototype, "manager", void 0);
//# sourceMappingURL=employee.dto.js.map