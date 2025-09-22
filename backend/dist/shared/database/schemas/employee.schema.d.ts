import { Document, Types } from 'mongoose';
export type EmployeeDocument = Employee & Document;
export declare enum EmploymentType {
    FULL_TIME = "full_time",
    PART_TIME = "part_time",
    CONTRACT = "contract",
    INTERN = "intern",
    CONSULTANT = "consultant"
}
export declare enum EmploymentStatus {
    ACTIVE = "active",
    ON_LEAVE = "on_leave",
    TERMINATED = "terminated",
    RESIGNED = "resigned",
    RETIRED = "retired"
}
export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export interface EmergencyContact {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
}
export interface Skill {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience: number;
    certifications?: string[];
}
export interface WorkExperience {
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    technologies?: string[];
}
export interface Education {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
    gpa?: number;
}
export declare class Employee {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    employeeId: string;
    department: string;
    position: string;
    employmentType: EmploymentType;
    employmentStatus: EmploymentStatus;
    hireDate: Date;
    terminationDate?: Date;
    managerId?: Types.ObjectId;
    salary: number;
    currency: string;
    salaryType: string;
    dateOfBirth?: Date;
    gender?: string;
    nationality?: string;
    address?: Address;
    emergencyContacts: EmergencyContact[];
    skills: Skill[];
    workExperience: WorkExperience[];
    education: Education[];
    certifications: string[];
    languages: string[];
    bio?: string;
    linkedinProfile?: string;
    githubProfile?: string;
    weeklyWorkingHours: number;
    timezone: string;
    preferences: Record<string, any>;
    metadata: Record<string, any>;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const EmployeeSchema: import("mongoose").Schema<Employee, import("mongoose").Model<Employee, any, any, any, Document<unknown, any, Employee, any, {}> & Employee & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Employee, Document<unknown, {}, import("mongoose").FlatRecord<Employee>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Employee> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
