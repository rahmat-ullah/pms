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
exports.UserStatsResponseDto = exports.UserListResponseDto = exports.UserResponseDto = exports.LinkEmployeeProfileDto = exports.UpdateUserRoleDto = exports.UpdateUserStatusDto = exports.ChangePasswordDto = exports.UserQueryDto = exports.UpdateUserDto = exports.CreateUserDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const user_schema_1 = require("../../../shared/database/schemas/user.schema");
class CreateUserDto {
    constructor() {
        this.role = user_schema_1.UserRole.EMPLOYEE;
        this.status = user_schema_1.UserStatus.PENDING;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { email: { required: true, type: () => String }, password: { required: true, type: () => String, minLength: 8 }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, role: { required: false, default: user_schema_1.UserRole.EMPLOYEE, enum: require("../../../shared/database/schemas/user.schema").UserRole }, status: { required: false, default: user_schema_1.UserStatus.PENDING, enum: require("../../../shared/database/schemas/user.schema").UserStatus }, phoneNumber: { required: false, type: () => String }, avatarUrl: { required: false, type: () => String }, permissions: { required: false, type: () => [String] }, emailVerified: { required: false, type: () => Boolean } };
    }
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SecurePassword123!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: user_schema_1.UserRole, default: user_schema_1.UserRole.EMPLOYEE }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_schema_1.UserRole),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: user_schema_1.UserStatus, default: user_schema_1.UserStatus.PENDING }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_schema_1.UserStatus),
    __metadata("design:type", String)
], CreateUserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1234567890' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/avatar.jpg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['read:projects', 'write:tasks'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUserDto.prototype, "emailVerified", void 0);
class UpdateUserDto extends (0, swagger_1.PartialType)(CreateUserDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return { email: { required: false, type: () => String }, firstName: { required: false, type: () => String }, lastName: { required: false, type: () => String }, role: { required: false, enum: require("../../../shared/database/schemas/user.schema").UserRole }, status: { required: false, enum: require("../../../shared/database/schemas/user.schema").UserStatus }, phoneNumber: { required: false, type: () => String }, avatarUrl: { required: false, type: () => String }, permissions: { required: false, type: () => [String] }, emailVerified: { required: false, type: () => Boolean } };
    }
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john@example.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Doe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: user_schema_1.UserRole }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_schema_1.UserRole),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: user_schema_1.UserStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_schema_1.UserStatus),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1234567890' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/avatar.jpg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['read:projects', 'write:tasks'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "emailVerified", void 0);
class UserQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
        this.includeArchived = false;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: false, type: () => Number, default: 1 }, limit: { required: false, type: () => Number, default: 10 }, search: { required: false, type: () => String }, role: { required: false, enum: require("../../../shared/database/schemas/user.schema").UserRole }, status: { required: false, enum: require("../../../shared/database/schemas/user.schema").UserStatus }, sortBy: { required: false, type: () => String, default: "createdAt" }, sortOrder: { required: false, type: () => Object, default: "desc" }, includeArchived: { required: false, type: () => Boolean, default: false } };
    }
}
exports.UserQueryDto = UserQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, description: 'Items per page' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john', description: 'Search term' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: user_schema_1.UserRole, description: 'Filter by role' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_schema_1.UserRole),
    __metadata("design:type", String)
], UserQueryDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: user_schema_1.UserStatus, description: 'Filter by status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_schema_1.UserStatus),
    __metadata("design:type", String)
], UserQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'createdAt', description: 'Sort field' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'desc', description: 'Sort order' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, description: 'Include archived users' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], UserQueryDto.prototype, "includeArchived", void 0);
class ChangePasswordDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { currentPassword: { required: true, type: () => String }, newPassword: { required: true, type: () => String, minLength: 8 } };
    }
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CurrentPassword123!' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NewPassword123!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class UpdateUserStatusDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, enum: require("../../../shared/database/schemas/user.schema").UserStatus } };
    }
}
exports.UpdateUserStatusDto = UpdateUserStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_schema_1.UserStatus }),
    (0, class_validator_1.IsEnum)(user_schema_1.UserStatus),
    __metadata("design:type", String)
], UpdateUserStatusDto.prototype, "status", void 0);
class UpdateUserRoleDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { role: { required: true, enum: require("../../../shared/database/schemas/user.schema").UserRole } };
    }
}
exports.UpdateUserRoleDto = UpdateUserRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_schema_1.UserRole }),
    (0, class_validator_1.IsEnum)(user_schema_1.UserRole),
    __metadata("design:type", String)
], UpdateUserRoleDto.prototype, "role", void 0);
class LinkEmployeeProfileDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { employeeProfileId: { required: true, type: () => String } };
    }
}
exports.LinkEmployeeProfileDto = LinkEmployeeProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], LinkEmployeeProfileDto.prototype, "employeeProfileId", void 0);
class UserResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, email: { required: true, type: () => String }, firstName: { required: true, type: () => String }, lastName: { required: true, type: () => String }, role: { required: true, enum: require("../../../shared/database/schemas/user.schema").UserRole }, status: { required: true, enum: require("../../../shared/database/schemas/user.schema").UserStatus }, phoneNumber: { required: false, type: () => String }, avatarUrl: { required: false, type: () => String }, permissions: { required: false, type: () => [String] }, emailVerified: { required: true, type: () => Boolean }, lastLoginAt: { required: false, type: () => Date }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, archivedAt: { required: false, type: () => Date } };
    }
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_schema_1.UserRole }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_schema_1.UserStatus }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1234567890' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/avatar.jpg' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['read:projects', 'write:tasks'] }),
    __metadata("design:type", Array)
], UserResponseDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "emailVerified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2023-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "lastLoginAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2023-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "archivedAt", void 0);
class UserListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { data: { required: true, type: () => [require("./user.dto").UserResponseDto] }, total: { required: true, type: () => Number }, page: { required: true, type: () => Number }, limit: { required: true, type: () => Number }, totalPages: { required: true, type: () => Number }, hasNextPage: { required: true, type: () => Boolean }, hasPrevPage: { required: true, type: () => Boolean } };
    }
}
exports.UserListResponseDto = UserListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [UserResponseDto] }),
    __metadata("design:type", Array)
], UserListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    __metadata("design:type", Number)
], UserListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], UserListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    __metadata("design:type", Number)
], UserListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    __metadata("design:type", Number)
], UserListResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], UserListResponseDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], UserListResponseDto.prototype, "hasPrevPage", void 0);
class UserStatsResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { total: { required: true, type: () => Number }, active: { required: true, type: () => Number }, inactive: { required: true, type: () => Number }, pending: { required: true, type: () => Number }, byRole: { required: true, type: () => Object } };
    }
}
exports.UserStatsResponseDto = UserStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    __metadata("design:type", Number)
], UserStatsResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 85 }),
    __metadata("design:type", Number)
], UserStatsResponseDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    __metadata("design:type", Number)
], UserStatsResponseDto.prototype, "inactive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], UserStatsResponseDto.prototype, "pending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            [user_schema_1.UserRole.ADMIN]: 5,
            [user_schema_1.UserRole.PROJECT_MANAGER]: 10,
            [user_schema_1.UserRole.EMPLOYEE]: 80,
        },
    }),
    __metadata("design:type", Object)
], UserStatsResponseDto.prototype, "byRole", void 0);
//# sourceMappingURL=user.dto.js.map