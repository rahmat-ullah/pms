import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  ChangePasswordDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  LinkEmployeeProfileDto,
  UserResponseDto,
  UserListResponseDto,
  UserStatsResponseDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../shared/database/schemas/user.schema';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return this.transformUserResponse(user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: UserListResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'includeArchived', required: false, type: Boolean })
  async findAll(@Query() queryDto: UserQueryDto): Promise<UserListResponseDto> {
    const result = await this.usersService.findAll(queryDto);
    return {
      ...result,
      data: result.data.map(user => this.transformUserResponse(user)),
    };
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully', type: UserStatsResponseDto })
  async getStats(): Promise<UserStatsResponseDto> {
    return this.usersService.getUserStats();
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Get all active users' })
  @ApiResponse({ status: 200, description: 'Active users retrieved successfully', type: [UserResponseDto] })
  async findActiveUsers(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findActiveUsers();
    return users.map(user => this.transformUserResponse(user));
  }

  @Get('recent')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Get recently created users' })
  @ApiResponse({ status: 200, description: 'Recent users retrieved successfully', type: [UserResponseDto] })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to look back' })
  async findRecentUsers(@Query('days') days?: number): Promise<UserResponseDto[]> {
    const users = await this.usersService.findRecentlyCreated(days);
    return users.map(user => this.transformUserResponse(user));
  }

  @Get('inactive')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Get inactive users' })
  @ApiResponse({ status: 200, description: 'Inactive users retrieved successfully', type: [UserResponseDto] })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days of inactivity' })
  async findInactiveUsers(@Query('days') days?: number): Promise<UserResponseDto[]> {
    const users = await this.usersService.findInactiveUsers(days);
    return users.map(user => this.transformUserResponse(user));
  }

  @Get('with-employee-profile')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Get users with employee profiles' })
  @ApiResponse({ status: 200, description: 'Users with employee profiles retrieved successfully', type: [UserResponseDto] })
  async findUsersWithEmployeeProfile(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findUsersWithEmployeeProfile();
    return users.map(user => this.transformUserResponse(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any): Promise<UserResponseDto> {
    // Users can view their own profile, admins and PMs can view any profile
    if (currentUser.id !== id && !this.hasAdminAccess(currentUser.role)) {
      // Additional authorization logic can be added here
    }
    
    const user = await this.usersService.findOne(id);
    return this.transformUserResponse(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    // Users can update their own profile (limited fields), admins can update any profile
    if (currentUser.id !== id && !this.hasAdminAccess(currentUser.role)) {
      // Remove sensitive fields that only admins can update
      delete updateUserDto.role;
      delete updateUserDto.status;
      delete updateUserDto.permissions;
    }

    const user = await this.usersService.update(id, updateUserDto);
    return this.transformUserResponse(user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore deleted user' })
  @ApiResponse({ status: 200, description: 'User restored successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async restore(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.restore(id);
    return this.transformUserResponse(user);
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 204, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    // Users can only change their own password, admins can change any password
    if (currentUser.id !== id && !this.hasAdminAccess(currentUser.role)) {
      throw new Error('Unauthorized');
    }

    await this.usersService.changePassword(id, changePasswordDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.updateStatus(id, updateStatusDto);
    return this.transformUserResponse(user);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.updateRole(id, updateRoleDto);
    return this.transformUserResponse(user);
  }

  @Post(':id/link-employee-profile')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Link user to employee profile' })
  @ApiResponse({ status: 200, description: 'Employee profile linked successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async linkEmployeeProfile(
    @Param('id') id: string,
    @Body() linkDto: LinkEmployeeProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.linkEmployeeProfile(id, linkDto);
    return this.transformUserResponse(user);
  }

  @Delete(':id/unlink-employee-profile')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Unlink user from employee profile' })
  @ApiResponse({ status: 200, description: 'Employee profile unlinked successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async unlinkEmployeeProfile(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.unlinkEmployeeProfile(id);
    return this.transformUserResponse(user);
  }

  @Post(':id/verify-email')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 204, description: 'Email verified successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async verifyEmail(@Param('id') id: string): Promise<void> {
    await this.usersService.verifyEmail(id);
  }

  private transformUserResponse(user: any): UserResponseDto {
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

  private hasAdminAccess(role: UserRole): boolean {
    return [UserRole.ADMIN, UserRole.PROJECT_MANAGER].includes(role);
  }
}
