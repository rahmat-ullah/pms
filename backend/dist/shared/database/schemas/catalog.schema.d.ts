import { Document, Types } from 'mongoose';
export type SkillDocument = Skill & Document;
export type DepartmentDocument = Department & Document;
export type RoleDocument = Role & Document;
export type LocationDocument = Location & Document;
export declare enum SkillCategory {
    TECHNICAL = "technical",
    SOFT_SKILLS = "soft_skills",
    LANGUAGE = "language",
    CERTIFICATION = "certification",
    DOMAIN_KNOWLEDGE = "domain_knowledge"
}
export declare enum SkillLevel {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced",
    EXPERT = "expert"
}
export declare class Skill {
    _id: Types.ObjectId;
    name: string;
    description: string;
    category: SkillCategory;
    aliases: string[];
    relatedSkills: string[];
    isActive: boolean;
    sortOrder: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Department {
    _id: Types.ObjectId;
    name: string;
    code: string;
    description: string;
    managerId?: Types.ObjectId;
    parentDepartmentId?: Types.ObjectId;
    location?: string;
    budgetAllocation: number;
    isActive: boolean;
    sortOrder: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Role {
    _id: Types.ObjectId;
    title: string;
    description: string;
    departmentId: Types.ObjectId;
    level: string;
    minSalary: number;
    maxSalary: number;
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    minExperience: number;
    isActive: boolean;
    sortOrder: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Location {
    _id: Types.ObjectId;
    name: string;
    code: string;
    type: string;
    address: string;
    city: string;
    country: string;
    timezone: string;
    capacity: number;
    isActive: boolean;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SkillSchema: import("mongoose").Schema<Skill, import("mongoose").Model<Skill, any, any, any, Document<unknown, any, Skill, any, {}> & Skill & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Skill, Document<unknown, {}, import("mongoose").FlatRecord<Skill>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Skill> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const DepartmentSchema: import("mongoose").Schema<Department, import("mongoose").Model<Department, any, any, any, Document<unknown, any, Department, any, {}> & Department & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Department, Document<unknown, {}, import("mongoose").FlatRecord<Department>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Department> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const RoleSchema: import("mongoose").Schema<Role, import("mongoose").Model<Role, any, any, any, Document<unknown, any, Role, any, {}> & Role & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Role, Document<unknown, {}, import("mongoose").FlatRecord<Role>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Role> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const LocationSchema: import("mongoose").Schema<Location, import("mongoose").Model<Location, any, any, any, Document<unknown, any, Location, any, {}> & Location & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Location, Document<unknown, {}, import("mongoose").FlatRecord<Location>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Location> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
