import { EmploymentType, EmploymentStatus, Address, EmergencyContact, Skill, WorkExperience, Education } from '../../../shared/database/schemas/employee.schema';
export declare class CreateEmployeeDto {
    userId: string;
    employeeId: string;
    department: string;
    position: string;
    employmentType: EmploymentType;
    employmentStatus?: EmploymentStatus;
    hireDate: string;
    managerId?: string;
    salary: number;
    currency?: string;
    salaryType?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    address?: Address;
    emergencyContacts?: EmergencyContact[];
    skills?: Skill[];
    workExperience?: WorkExperience[];
    education?: Education[];
    certifications?: string[];
    languages?: string[];
    bio?: string;
    linkedinProfile?: string;
    githubProfile?: string;
    weeklyWorkingHours?: number;
    timezone?: string;
    preferences?: Record<string, any>;
    metadata?: Record<string, any>;
}
declare const UpdateEmployeeDto_base: import("@nestjs/common").Type<Partial<CreateEmployeeDto>>;
export declare class UpdateEmployeeDto extends UpdateEmployeeDto_base {
    terminationDate?: string;
}
export declare class EmployeeQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    position?: string;
    employmentType?: EmploymentType;
    employmentStatus?: EmploymentStatus;
    managerId?: string;
    skills?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeTerminated?: boolean;
}
export declare class EmployeeResponseDto {
    id: string;
    userId: string;
    employeeId: string;
    department: string;
    position: string;
    employmentType: EmploymentType;
    employmentStatus: EmploymentStatus;
    hireDate: Date;
    terminationDate?: Date;
    managerId?: string;
    salary: number;
    currency: string;
    salaryType: string;
    dateOfBirth?: Date;
    gender?: string;
    nationality?: string;
    address?: Address;
    emergencyContacts?: EmergencyContact[];
    skills?: Skill[];
    workExperience?: WorkExperience[];
    education?: Education[];
    certifications?: string[];
    languages?: string[];
    bio?: string;
    linkedinProfile?: string;
    githubProfile?: string;
    weeklyWorkingHours: number;
    timezone: string;
    preferences?: Record<string, any>;
    metadata?: Record<string, any>;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        fullName: string;
        profileImage?: string;
    };
    manager?: {
        id: string;
        employeeId: string;
        user: {
            firstName: string;
            lastName: string;
            fullName: string;
        };
    };
}
export {};
