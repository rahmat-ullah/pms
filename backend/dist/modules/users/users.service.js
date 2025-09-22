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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const argon2 = require("argon2");
const user_repository_1 = require("../../shared/database/repositories/user.repository");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        const existingUser = await this.userRepository.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await argon2.hash(createUserDto.password);
        const userData = {
            ...createUserDto,
            password: hashedPassword,
        };
        return this.userRepository.create(userData);
    }
    async findAll(queryDto) {
        const { page, limit, search, role, status, sortBy, sortOrder, includeArchived } = queryDto;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        return this.userRepository.searchUsers({
            page,
            limit,
            sort,
            role,
            status,
            searchTerm: search,
            includeArchived,
        });
    }
    async findOne(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.userRepository.findByEmail(email);
    }
    async update(id, updateUserDto) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailExists = await this.userRepository.findByEmail(updateUserDto.email);
            if (emailExists) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        const updatedUser = await this.userRepository.update(id, updateUserDto);
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async remove(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.userRepository.softDelete(id);
    }
    async restore(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const restoredUser = await this.userRepository.restore(id);
        if (!restoredUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return restoredUser;
    }
    async changePassword(id, changePasswordDto) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const user = await this.userRepository.findByEmailWithPassword((await this.userRepository.findById(id))?.email || '');
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isCurrentPasswordValid = await argon2.verify(user.password, changePasswordDto.currentPassword);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const hashedNewPassword = await argon2.hash(changePasswordDto.newPassword);
        await this.userRepository.updatePassword(id, hashedNewPassword);
    }
    async updateStatus(id, updateStatusDto) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const updatedUser = await this.userRepository.updateStatus(id, updateStatusDto.status);
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async updateRole(id, updateRoleDto) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const updatedUser = await this.userRepository.update(id, { role: updateRoleDto.role });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async linkEmployeeProfile(id, linkDto) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        if (!mongoose_1.Types.ObjectId.isValid(linkDto.employeeProfileId)) {
            throw new common_1.BadRequestException('Invalid employee profile ID');
        }
        const updatedUser = await this.userRepository.linkEmployeeProfile(id, new mongoose_1.Types.ObjectId(linkDto.employeeProfileId));
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async unlinkEmployeeProfile(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const updatedUser = await this.userRepository.unlinkEmployeeProfile(id);
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async findByRole(role) {
        return this.userRepository.findByRole(role);
    }
    async findByStatus(status) {
        return this.userRepository.findByStatus(status);
    }
    async findActiveUsers() {
        return this.userRepository.findActiveUsers();
    }
    async findUsersWithEmployeeProfile() {
        return this.userRepository.findUsersWithEmployeeProfile();
    }
    async getUserStats() {
        return this.userRepository.getUserStats();
    }
    async findRecentlyCreated(days = 7) {
        return this.userRepository.findRecentlyCreated(days);
    }
    async findInactiveUsers(days = 30) {
        return this.userRepository.findInactiveUsers(days);
    }
    async verifyEmail(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.userRepository.verifyEmail(id);
    }
    async bulkUpdateStatus(userIds, status) {
        const validIds = userIds.filter(id => mongoose_1.Types.ObjectId.isValid(id));
        if (validIds.length !== userIds.length) {
            throw new common_1.BadRequestException('One or more invalid user IDs');
        }
        await Promise.all(validIds.map(id => this.userRepository.updateStatus(id, status)));
    }
    async bulkDelete(userIds) {
        const validIds = userIds.filter(id => mongoose_1.Types.ObjectId.isValid(id));
        if (validIds.length !== userIds.length) {
            throw new common_1.BadRequestException('One or more invalid user IDs');
        }
        await Promise.all(validIds.map(id => this.userRepository.softDelete(id)));
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map