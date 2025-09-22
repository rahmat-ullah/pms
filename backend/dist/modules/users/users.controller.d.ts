import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, ChangePasswordDto, UpdateUserStatusDto, UpdateUserRoleDto, LinkEmployeeProfileDto, UserResponseDto, UserListResponseDto, UserStatsResponseDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findAll(queryDto: UserQueryDto): Promise<UserListResponseDto>;
    getStats(): Promise<UserStatsResponseDto>;
    findActiveUsers(): Promise<UserResponseDto[]>;
    findRecentUsers(days?: number): Promise<UserResponseDto[]>;
    findInactiveUsers(days?: number): Promise<UserResponseDto[]>;
    findUsersWithEmployeeProfile(): Promise<UserResponseDto[]>;
    findOne(id: string, currentUser: any): Promise<UserResponseDto>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<UserResponseDto>;
    remove(id: string): Promise<void>;
    restore(id: string): Promise<UserResponseDto>;
    changePassword(id: string, changePasswordDto: ChangePasswordDto, currentUser: any): Promise<void>;
    updateStatus(id: string, updateStatusDto: UpdateUserStatusDto): Promise<UserResponseDto>;
    updateRole(id: string, updateRoleDto: UpdateUserRoleDto): Promise<UserResponseDto>;
    linkEmployeeProfile(id: string, linkDto: LinkEmployeeProfileDto): Promise<UserResponseDto>;
    unlinkEmployeeProfile(id: string): Promise<UserResponseDto>;
    verifyEmail(id: string): Promise<void>;
    private transformUserResponse;
    private hasAdminAccess;
}
