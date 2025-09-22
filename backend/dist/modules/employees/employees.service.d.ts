import { EmployeeRepository } from '../../shared/database/repositories/employee.repository';
import { UserRepository } from '../../shared/database/repositories/user.repository';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto, EmployeeResponseDto } from './dto/employee.dto';
import { EmploymentStatus } from '../../shared/database/schemas/employee.schema';
export declare class EmployeesService {
    private readonly employeeRepository;
    private readonly userRepository;
    constructor(employeeRepository: EmployeeRepository, userRepository: UserRepository);
    create(createEmployeeDto: CreateEmployeeDto, currentUserId: string): Promise<EmployeeResponseDto>;
    findAll(query: EmployeeQueryDto): Promise<{
        employees: EmployeeResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<EmployeeResponseDto>;
    findByUserId(userId: string): Promise<EmployeeResponseDto>;
    findByEmployeeId(employeeId: string): Promise<EmployeeResponseDto>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto, currentUserId: string): Promise<EmployeeResponseDto>;
    updateEmploymentStatus(id: string, status: EmploymentStatus, currentUserId: string): Promise<EmployeeResponseDto>;
    addSkill(id: string, skill: any, currentUserId: string): Promise<EmployeeResponseDto>;
    removeSkill(id: string, skillName: string, currentUserId: string): Promise<EmployeeResponseDto>;
    addWorkExperience(id: string, experience: any, currentUserId: string): Promise<EmployeeResponseDto>;
    addEducation(id: string, education: any, currentUserId: string): Promise<EmployeeResponseDto>;
    searchBySkills(skills: string[], query: EmployeeQueryDto): Promise<{
        employees: EmployeeResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getEmployeeStats(): Promise<any>;
    getDepartmentStats(): Promise<any>;
    private buildSearchFilter;
    private mapToResponseDto;
}
