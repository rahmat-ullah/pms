import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto, EmployeeResponseDto } from './dto/employee.dto';
import { EmploymentStatus } from '../../shared/database/schemas/employee.schema';
import { FilesService } from '../files/files.service';
export declare class EmployeesController {
    private readonly employeesService;
    private readonly filesService;
    constructor(employeesService: EmployeesService, filesService: FilesService);
    create(createEmployeeDto: CreateEmployeeDto, currentUser: any): Promise<EmployeeResponseDto>;
    findAll(query: EmployeeQueryDto): Promise<{
        employees: EmployeeResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getEmployeeStats(): Promise<any>;
    getDepartmentStats(): Promise<any>;
    searchBySkills(skills: string[], query: EmployeeQueryDto): Promise<{
        employees: EmployeeResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByUserId(userId: string): Promise<EmployeeResponseDto>;
    findByEmployeeId(employeeId: string): Promise<EmployeeResponseDto>;
    findById(id: string): Promise<EmployeeResponseDto>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto, currentUser: any): Promise<EmployeeResponseDto>;
    updateEmploymentStatus(id: string, status: EmploymentStatus, currentUser: any): Promise<EmployeeResponseDto>;
    uploadProfileImage(id: string, file: Express.Multer.File, currentUser: any): Promise<{
        message: string;
        url: string;
        fileId: string;
    }>;
    addSkill(id: string, skill: any, currentUser: any): Promise<EmployeeResponseDto>;
    removeSkill(id: string, skillName: string, currentUser: any): Promise<EmployeeResponseDto>;
    addWorkExperience(id: string, experience: any, currentUser: any): Promise<EmployeeResponseDto>;
    addEducation(id: string, education: any, currentUser: any): Promise<EmployeeResponseDto>;
}
