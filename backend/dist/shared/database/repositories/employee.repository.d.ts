import { Model, Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginationResult } from './base.repository';
import { EmployeeDocument, EmploymentType, EmploymentStatus } from '../schemas/employee.schema';
export interface EmployeeSearchOptions extends PaginationOptions {
    department?: string;
    position?: string;
    employmentType?: EmploymentType;
    employmentStatus?: EmploymentStatus;
    managerId?: string;
    skills?: string[];
    searchTerm?: string;
    salaryRange?: {
        min?: number;
        max?: number;
    };
}
export declare class EmployeeRepository extends BaseRepository<EmployeeDocument> {
    private employeeModel;
    constructor(employeeModel: Model<EmployeeDocument>);
    findByUserId(userId: string | Types.ObjectId): Promise<EmployeeDocument | null>;
    findByUserIdWithPopulation(userId: string | Types.ObjectId): Promise<EmployeeDocument | null>;
    findByEmployeeId(employeeId: string): Promise<EmployeeDocument | null>;
    findByEmployeeIdWithPopulation(employeeId: string): Promise<EmployeeDocument | null>;
    findByIdWithPopulation(id: string | Types.ObjectId): Promise<EmployeeDocument | null>;
    searchEmployees(options: EmployeeSearchOptions): Promise<PaginationResult<EmployeeDocument>>;
    findByDepartment(department: string): Promise<EmployeeDocument[]>;
    findByManager(managerId: string | Types.ObjectId): Promise<EmployeeDocument[]>;
    findBySkills(skills: string[]): Promise<EmployeeDocument[]>;
    findBySkillLevel(skill: string, level: string): Promise<EmployeeDocument[]>;
    findActiveEmployees(): Promise<EmployeeDocument[]>;
    findEmployeesHiredInRange(startDate: Date, endDate: Date): Promise<EmployeeDocument[]>;
    updateSkills(employeeId: string | Types.ObjectId, skills: any[]): Promise<EmployeeDocument | null>;
    updateSalary(employeeId: string | Types.ObjectId, salary: number, currency?: string): Promise<EmployeeDocument | null>;
    updateManager(employeeId: string | Types.ObjectId, managerId: Types.ObjectId | null): Promise<EmployeeDocument | null>;
    updateEmploymentStatus(employeeId: string | Types.ObjectId, status: EmploymentStatus, terminationDate?: Date): Promise<EmployeeDocument | null>;
    getEmployeeStats(): Promise<{
        total: number;
        active: number;
        byDepartment: Record<string, number>;
        byEmploymentType: Record<EmploymentType, number>;
        averageSalary: number;
        totalSalaryExpense: number;
    }>;
    getDepartmentStats(): Promise<any[]>;
    addSkill(employeeId: string, skill: any, updatedBy: string): Promise<EmployeeDocument>;
    removeSkill(employeeId: string, skillName: string, updatedBy: string): Promise<EmployeeDocument>;
    addWorkExperience(employeeId: string, experience: any, updatedBy: string): Promise<EmployeeDocument>;
    addEducation(employeeId: string, education: any, updatedBy: string): Promise<EmployeeDocument>;
    findUpcomingAnniversaries(days?: number): Promise<EmployeeDocument[]>;
    getSkillsDistribution(): Promise<Array<{
        skill: string;
        count: number;
    }>>;
}
