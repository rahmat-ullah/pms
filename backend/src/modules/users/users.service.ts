import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import * as argon2 from 'argon2';
import { UserRepository } from '../../shared/database/repositories/user.repository';
import { UserDocument, UserRole, UserStatus } from '../../shared/database/schemas/user.schema';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  ChangePasswordDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  LinkEmployeeProfileDto,
} from './dto/user.dto';
import { PaginationResult } from '../../shared/database/repositories/base.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await argon2.hash(createUserDto.password);

    // Create user
    const userData: any = {
      ...createUserDto,
      password: hashedPassword,
    };

    return this.userRepository.create(userData);
  }

  async findAll(queryDto: UserQueryDto): Promise<PaginationResult<UserDocument>> {
    const { page, limit, search, role, status, sortBy, sortOrder, includeArchived } = queryDto;

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

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

  async findOne(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(updateUserDto.email);
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.softDelete(id);
  }

  async restore(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const restoredUser = await this.userRepository.restore(id);
    if (!restoredUser) {
      throw new NotFoundException('User not found');
    }

    return restoredUser;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepository.findByEmailWithPassword(
      (await this.userRepository.findById(id))?.email || '',
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await argon2.verify(user.password, changePasswordDto.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await argon2.hash(changePasswordDto.newPassword);

    // Update password
    await this.userRepository.updatePassword(id, hashedNewPassword);
  }

  async updateStatus(id: string, updateStatusDto: UpdateUserStatusDto): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const updatedUser = await this.userRepository.updateStatus(id, updateStatusDto.status);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async updateRole(id: string, updateRoleDto: UpdateUserRoleDto): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const updatedUser = await this.userRepository.update(id, { role: updateRoleDto.role });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async linkEmployeeProfile(id: string, linkDto: LinkEmployeeProfileDto): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    if (!Types.ObjectId.isValid(linkDto.employeeProfileId)) {
      throw new BadRequestException('Invalid employee profile ID');
    }

    const updatedUser = await this.userRepository.linkEmployeeProfile(
      id,
      new Types.ObjectId(linkDto.employeeProfileId),
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async unlinkEmployeeProfile(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const updatedUser = await this.userRepository.unlinkEmployeeProfile(id);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async findByRole(role: UserRole): Promise<UserDocument[]> {
    return this.userRepository.findByRole(role);
  }

  async findByStatus(status: UserStatus): Promise<UserDocument[]> {
    return this.userRepository.findByStatus(status);
  }

  async findActiveUsers(): Promise<UserDocument[]> {
    return this.userRepository.findActiveUsers();
  }

  async findUsersWithEmployeeProfile(): Promise<UserDocument[]> {
    return this.userRepository.findUsersWithEmployeeProfile();
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    byRole: Record<UserRole, number>;
  }> {
    return this.userRepository.getUserStats();
  }

  async findRecentlyCreated(days: number = 7): Promise<UserDocument[]> {
    return this.userRepository.findRecentlyCreated(days);
  }

  async findInactiveUsers(days: number = 30): Promise<UserDocument[]> {
    return this.userRepository.findInactiveUsers(days);
  }

  async verifyEmail(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.verifyEmail(id);
  }

  async bulkUpdateStatus(userIds: string[], status: UserStatus): Promise<void> {
    const validIds = userIds.filter(id => Types.ObjectId.isValid(id));

    if (validIds.length !== userIds.length) {
      throw new BadRequestException('One or more invalid user IDs');
    }

    await Promise.all(
      validIds.map(id => this.userRepository.updateStatus(id, status))
    );
  }

  async bulkDelete(userIds: string[]): Promise<void> {
    const validIds = userIds.filter(id => Types.ObjectId.isValid(id));

    if (validIds.length !== userIds.length) {
      throw new BadRequestException('One or more invalid user IDs');
    }

    await Promise.all(
      validIds.map(id => this.userRepository.softDelete(id))
    );
  }
}
