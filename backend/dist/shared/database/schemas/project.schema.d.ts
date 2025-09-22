import { Document, Types } from 'mongoose';
export type ProjectDocument = Project & Document;
export declare enum ProjectStatus {
    PLANNING = "planning",
    ACTIVE = "active",
    ON_HOLD = "on_hold",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    ARCHIVED = "archived"
}
export declare enum ProjectPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum TeamMemberRole {
    PROJECT_MANAGER = "project_manager",
    TECH_LEAD = "tech_lead",
    SENIOR_DEVELOPER = "senior_developer",
    DEVELOPER = "developer",
    JUNIOR_DEVELOPER = "junior_developer",
    QA_ENGINEER = "qa_engineer",
    DESIGNER = "designer",
    BUSINESS_ANALYST = "business_analyst",
    DEVOPS_ENGINEER = "devops_engineer",
    CONSULTANT = "consultant"
}
export interface TeamMember {
    employeeId: Types.ObjectId;
    role: TeamMemberRole;
    allocatedHours: number;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    responsibilities?: string[];
}
export interface ProjectMilestone {
    name: string;
    description: string;
    dueDate: Date;
    completedDate?: Date;
    isCompleted: boolean;
    deliverables: string[];
}
export interface ProjectBudget {
    totalBudget: number;
    spentBudget: number;
    currency: string;
    budgetCategories: {
        category: string;
        allocated: number;
        spent: number;
    }[];
}
export interface ProjectRisk {
    id: string;
    title: string;
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
    status: 'open' | 'mitigated' | 'closed';
    identifiedDate: Date;
    mitigatedDate?: Date;
}
export declare class Project {
    _id: Types.ObjectId;
    name: string;
    code: string;
    description: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    projectManagerId: Types.ObjectId;
    clientId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
    teamMembers: TeamMember[];
    technologies: string[];
    tags: string[];
    milestones: ProjectMilestone[];
    budget?: ProjectBudget;
    risks: ProjectRisk[];
    progressPercentage: number;
    estimatedHours: number;
    actualHours: number;
    repositoryUrl?: string;
    documentationUrl?: string;
    deploymentUrl?: string;
    metadata: Record<string, any>;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    archivedAt?: Date;
    archivedBy?: Types.ObjectId;
    get isActive(): boolean;
    get isOverdue(): boolean;
    get totalTeamMembers(): number;
    get totalAllocatedHours(): number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProjectSchema: import("mongoose").Schema<Project, import("mongoose").Model<Project, any, any, any, Document<unknown, any, Project, any, {}> & Project & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Project, Document<unknown, {}, import("mongoose").FlatRecord<Project>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Project> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
