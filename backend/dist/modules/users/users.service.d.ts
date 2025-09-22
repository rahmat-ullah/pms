import { UserRepository } from '../../shared/database/repositories/user.repository';
import { UserDocument, UserRole, UserStatus } from '../../shared/database/schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UserQueryDto, ChangePasswordDto, UpdateUserStatusDto, UpdateUserRoleDto, LinkEmployeeProfileDto } from './dto/user.dto';
import { PaginationResult } from '../../shared/database/repositories/base.repository';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    create(createUserDto: CreateUserDto): Promise<UserDocument>;
    findAll(queryDto: UserQueryDto): Promise<PaginationResult<UserDocument>>;
    findOne(id: string): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument>;
    remove(id: string): Promise<void>;
    restore(id: string): Promise<UserDocument>;
    changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void>;
    updateStatus(id: string, updateStatusDto: UpdateUserStatusDto): Promise<UserDocument>;
    updateRole(id: string, updateRoleDto: UpdateUserRoleDto): Promise<UserDocument>;
    linkEmployeeProfile(id: string, linkDto: LinkEmployeeProfileDto): Promise<UserDocument>;
    unlinkEmployeeProfile(id: string): Promise<UserDocument>;
    findByRole(role: UserRole): Promise<UserDocument[]>;
    findByStatus(status: UserStatus): Promise<UserDocument[]>;
    findActiveUsers(): Promise<UserDocument[]>;
    findUsersWithEmployeeProfile(): Promise<UserDocument[]>;
    getUserStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        pending: number;
        byRole: Record<UserRole, number>;
    }>;
    findRecentlyCreated(days?: number): Promise<UserDocument[]>;
    findInactiveUsers(days?: number): Promise<UserDocument[]>;
    verifyEmail(id: string): Promise<void>;
    bulkUpdateStatus(userIds: string[], status: UserStatus): Promise<void>;
    bulkDelete(userIds: string[]): Promise<void>;
}
