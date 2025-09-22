import { UserRole, UserStatus } from '../../../shared/database/schemas/user.schema';
export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    status?: UserStatus;
    phoneNumber?: string;
    avatarUrl?: string;
    permissions?: string[];
    emailVerified?: boolean;
}
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    status?: UserStatus;
    phoneNumber?: string;
    avatarUrl?: string;
    permissions?: string[];
    emailVerified?: boolean;
}
export declare class UserQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeArchived?: boolean;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class UpdateUserStatusDto {
    status: UserStatus;
}
export declare class UpdateUserRoleDto {
    role: UserRole;
}
export declare class LinkEmployeeProfileDto {
    employeeProfileId: string;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    phoneNumber?: string;
    avatarUrl?: string;
    permissions?: string[];
    emailVerified: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    archivedAt?: Date;
}
export declare class UserListResponseDto {
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export declare class UserStatsResponseDto {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    byRole: Record<UserRole, number>;
}
export {};
