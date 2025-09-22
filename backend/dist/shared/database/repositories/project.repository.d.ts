import { Model, Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginationResult } from './base.repository';
import { ProjectDocument, ProjectStatus, ProjectPriority, TeamMember } from '../schemas/project.schema';
export interface ProjectSearchOptions extends PaginationOptions {
    status?: ProjectStatus;
    priority?: ProjectPriority;
    projectManagerId?: string;
    clientId?: string;
    technologies?: string[];
    tags?: string[];
    searchTerm?: string;
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    includeArchived?: boolean;
}
export declare class ProjectRepository extends BaseRepository<ProjectDocument> {
    private projectModel;
    constructor(projectModel: Model<ProjectDocument>);
    findByCode(code: string): Promise<ProjectDocument | null>;
    searchProjects(options: ProjectSearchOptions): Promise<PaginationResult<ProjectDocument>>;
    findByStatus(status: ProjectStatus): Promise<ProjectDocument[]>;
    findByProjectManager(projectManagerId: string | Types.ObjectId): Promise<ProjectDocument[]>;
    findByClient(clientId: string | Types.ObjectId): Promise<ProjectDocument[]>;
    findByEmployee(employeeId: string | Types.ObjectId): Promise<ProjectDocument[]>;
    findActiveProjects(): Promise<ProjectDocument[]>;
    findOverdueProjects(): Promise<ProjectDocument[]>;
    findProjectsEndingSoon(days?: number): Promise<ProjectDocument[]>;
    addTeamMember(projectId: string | Types.ObjectId, teamMember: TeamMember): Promise<ProjectDocument | null>;
    removeTeamMember(projectId: string | Types.ObjectId, employeeId: string | Types.ObjectId): Promise<ProjectDocument | null>;
    updateTeamMemberRole(projectId: string | Types.ObjectId, employeeId: string | Types.ObjectId, role: string): Promise<ProjectDocument | null>;
    updateTeamMemberAllocation(projectId: string | Types.ObjectId, employeeId: string | Types.ObjectId, allocatedHours: number): Promise<ProjectDocument | null>;
    updateProgress(projectId: string | Types.ObjectId, progressPercentage: number): Promise<ProjectDocument | null>;
    updateStatus(projectId: string | Types.ObjectId, status: ProjectStatus): Promise<ProjectDocument | null>;
    addMilestone(projectId: string | Types.ObjectId, milestone: any): Promise<ProjectDocument | null>;
    updateMilestone(projectId: string | Types.ObjectId, milestoneIndex: number, milestone: any): Promise<ProjectDocument | null>;
    getProjectStats(): Promise<{
        total: number;
        active: number;
        completed: number;
        overdue: number;
        byStatus: Record<ProjectStatus, number>;
        byPriority: Record<ProjectPriority, number>;
        averageProgress: number;
    }>;
    getResourceAllocation(): Promise<Array<{
        employeeId: string;
        totalAllocatedHours: number;
        activeProjects: number;
    }>>;
}
