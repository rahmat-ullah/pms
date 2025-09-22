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
exports.UsersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const user_dto_1 = require("./dto/user.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_schema_1 = require("../../shared/database/schemas/user.schema");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(createUserDto) {
        const user = await this.usersService.create(createUserDto);
        return this.transformUserResponse(user);
    }
    async findAll(queryDto) {
        const result = await this.usersService.findAll(queryDto);
        return {
            ...result,
            data: result.data.map(user => this.transformUserResponse(user)),
        };
    }
    async getStats() {
        return this.usersService.getUserStats();
    }
    async findActiveUsers() {
        const users = await this.usersService.findActiveUsers();
        return users.map(user => this.transformUserResponse(user));
    }
    async findRecentUsers(days) {
        const users = await this.usersService.findRecentlyCreated(days);
        return users.map(user => this.transformUserResponse(user));
    }
    async findInactiveUsers(days) {
        const users = await this.usersService.findInactiveUsers(days);
        return users.map(user => this.transformUserResponse(user));
    }
    async findUsersWithEmployeeProfile() {
        const users = await this.usersService.findUsersWithEmployeeProfile();
        return users.map(user => this.transformUserResponse(user));
    }
    async findOne(id, currentUser) {
        if (currentUser.id !== id && !this.hasAdminAccess(currentUser.role)) {
        }
        const user = await this.usersService.findOne(id);
        return this.transformUserResponse(user);
    }
    async update(id, updateUserDto, currentUser) {
        if (currentUser.id !== id && !this.hasAdminAccess(currentUser.role)) {
            delete updateUserDto.role;
            delete updateUserDto.status;
            delete updateUserDto.permissions;
        }
        const user = await this.usersService.update(id, updateUserDto);
        return this.transformUserResponse(user);
    }
    async remove(id) {
        await this.usersService.remove(id);
    }
    async restore(id) {
        const user = await this.usersService.restore(id);
        return this.transformUserResponse(user);
    }
    async changePassword(id, changePasswordDto, currentUser) {
        if (currentUser.id !== id && !this.hasAdminAccess(currentUser.role)) {
            throw new Error('Unauthorized');
        }
        await this.usersService.changePassword(id, changePasswordDto);
    }
    async updateStatus(id, updateStatusDto) {
        const user = await this.usersService.updateStatus(id, updateStatusDto);
        return this.transformUserResponse(user);
    }
    async updateRole(id, updateRoleDto) {
        const user = await this.usersService.updateRole(id, updateRoleDto);
        return this.transformUserResponse(user);
    }
    async linkEmployeeProfile(id, linkDto) {
        const user = await this.usersService.linkEmployeeProfile(id, linkDto);
        return this.transformUserResponse(user);
    }
    async unlinkEmployeeProfile(id) {
        const user = await this.usersService.unlinkEmployeeProfile(id);
        return this.transformUserResponse(user);
    }
    async verifyEmail(id) {
        await this.usersService.verifyEmail(id);
    }
    transformUserResponse(user) {
        return {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            phoneNumber: user.phoneNumber,
            avatarUrl: user.avatarUrl,
            permissions: user.permissions,
            emailVerified: !!user.emailVerifiedAt,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            archivedAt: user.archivedAt,
        };
    }
    hasAdminAccess(role) {
        return [user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER].includes(role);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created successfully', type: user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    openapi.ApiResponse({ status: 201, type: require("./dto/user.dto").UserResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully', type: user_dto_1.UserListResponseDto }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: user_schema_1.UserRole }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    (0, swagger_1.ApiQuery)({ name: 'includeArchived', required: false, type: Boolean }),
    openapi.ApiResponse({ status: 200, type: require("./dto/user.dto").UserListResponseDto }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UserQueryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get user statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User statistics retrieved successfully', type: user_dto_1.UserStatsResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("./dto/user.dto").UserStatsResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all active users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active users retrieved successfully', type: [user_dto_1.UserResponseDto] }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/user.dto").UserResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findActiveUsers", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get recently created users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recent users retrieved successfully', type: [user_dto_1.UserResponseDto] }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number, description: 'Number of days to look back' }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/user.dto").UserResponseDto] }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findRecentUsers", null);
__decorate([
    (0, common_1.Get)('inactive'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get inactive users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inactive users retrieved successfully', type: [user_dto_1.UserResponseDto] }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, type: Number, description: 'Number of days of inactivity' }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/user.dto").UserResponseDto] }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findInactiveUsers", null);
__decorate([
    (0, common_1.Get)('with-employee-profile'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get users with employee profiles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users with employee profiles retrieved successfully', type: [user_dto_1.UserResponseDto] }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/user.dto").UserResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findUsersWithEmployeeProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User retrieved successfully', type: user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/user.dto").UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully', type: user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/user.dto").UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Restore deleted user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User restored successfully', type: user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    openapi.ApiResponse({ status: 201, type: require("./dto/user.dto").UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "restore", null);
__decorate([
    (0, common_1.Post)(':id/change-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Change user password' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Password changed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid current password' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update user status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User status updated successfully', type: user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/user.dto").UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserStatusDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update user role' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User role updated successfully', type: user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/user.dto").UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserRoleDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Post)(':id/link-employee-profile'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Link user to employee profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Employee profile linked successfully', type: user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    openapi.ApiResponse({ status: 201, type: require("./dto/user.dto").UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.LinkEmployeeProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "linkEmployeeProfile", null);
__decorate([
    (0, common_1.Delete)(':id/unlink-employee-profile'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink user from employee profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Employee profile unlinked successfully', type: user_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/user.dto").UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "unlinkEmployeeProfile", null);
__decorate([
    (0, common_1.Post)(':id/verify-email'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Verify user email' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Email verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "verifyEmail", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map