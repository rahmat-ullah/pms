import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginationResult } from './base.repository';
import { Project, ProjectDocument, ProjectStatus, ProjectPriority, TeamMember } from '../schemas/project.schema';

export interface ProjectSearchOptions extends PaginationOptions {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  projectManagerId?: string;
  clientId?: string;
  technologies?: string[];
  tags?: string[];
  searchTerm?: string;
  dateRange?: { start?: Date; end?: Date };
  includeArchived?: boolean;
}

@Injectable()
export class ProjectRepository extends BaseRepository<ProjectDocument> {
  constructor(@InjectModel(Project.name) private projectModel: Model<ProjectDocument>) {
    super(projectModel);
  }

  async findByCode(code: string): Promise<ProjectDocument | null> {
    return this.projectModel.findOne({ code }).populate('projectManagerId clientId teamMembers.employeeId').exec();
  }

  async searchProjects(options: ProjectSearchOptions): Promise<PaginationResult<ProjectDocument>> {
    const {
      status,
      priority,
      projectManagerId,
      clientId,
      technologies,
      tags,
      searchTerm,
      dateRange,
      includeArchived = false,
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
    } = options;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (projectManagerId) {
      filter.projectManagerId = projectManagerId;
    }

    if (clientId) {
      filter.clientId = clientId;
    }

    if (technologies && technologies.length > 0) {
      filter.technologies = { $in: technologies };
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (dateRange) {
      filter.startDate = {};
      if (dateRange.start) {
        filter.startDate.$gte = dateRange.start;
      }
      if (dateRange.end) {
        filter.startDate.$lte = dateRange.end;
      }
    }

    if (!includeArchived) {
      filter.archivedAt = { $exists: false };
    }

    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { code: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { technologies: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const result = await this.findWithPagination(filter, { page, limit, sort });
    
    // Populate related data
    await this.projectModel.populate(result.data, {
      path: 'projectManagerId clientId teamMembers.employeeId',
    });
    
    return result;
  }

  async findByStatus(status: ProjectStatus): Promise<ProjectDocument[]> {
    return this.projectModel.find({
      status,
      archivedAt: { $exists: false },
    }).populate('projectManagerId clientId').exec();
  }

  async findByProjectManager(projectManagerId: string | Types.ObjectId): Promise<ProjectDocument[]> {
    return this.projectModel.find({
      projectManagerId,
      archivedAt: { $exists: false },
    }).populate('projectManagerId clientId').exec();
  }

  async findByClient(clientId: string | Types.ObjectId): Promise<ProjectDocument[]> {
    return this.projectModel.find({
      clientId,
      archivedAt: { $exists: false },
    }).populate('projectManagerId clientId').exec();
  }

  async findByEmployee(employeeId: string | Types.ObjectId): Promise<ProjectDocument[]> {
    return this.projectModel.find({
      'teamMembers.employeeId': employeeId,
      'teamMembers.isActive': true,
      archivedAt: { $exists: false },
    }).populate('projectManagerId clientId teamMembers.employeeId').exec();
  }

  async findActiveProjects(): Promise<ProjectDocument[]> {
    return this.projectModel.find({
      status: ProjectStatus.ACTIVE,
      archivedAt: { $exists: false },
    }).populate('projectManagerId clientId').exec();
  }

  async findOverdueProjects(): Promise<ProjectDocument[]> {
    const today = new Date();
    return this.projectModel.find({
      endDate: { $lt: today },
      status: { $nin: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED] },
      archivedAt: { $exists: false },
    }).populate('projectManagerId clientId').exec();
  }

  async findProjectsEndingSoon(days: number = 7): Promise<ProjectDocument[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.projectModel.find({
      endDate: { $gte: today, $lte: futureDate },
      status: ProjectStatus.ACTIVE,
      archivedAt: { $exists: false },
    }).populate('projectManagerId clientId').exec();
  }

  async addTeamMember(
    projectId: string | Types.ObjectId,
    teamMember: TeamMember,
  ): Promise<ProjectDocument | null> {
    return this.projectModel.findByIdAndUpdate(
      projectId,
      { $push: { teamMembers: teamMember } },
      { new: true },
    ).populate('projectManagerId clientId teamMembers.employeeId').exec();
  }

  async removeTeamMember(
    projectId: string | Types.ObjectId,
    employeeId: string | Types.ObjectId,
  ): Promise<ProjectDocument | null> {
    return this.projectModel.findByIdAndUpdate(
      projectId,
      { $pull: { teamMembers: { employeeId } } },
      { new: true },
    ).populate('projectManagerId clientId teamMembers.employeeId').exec();
  }

  async updateTeamMemberRole(
    projectId: string | Types.ObjectId,
    employeeId: string | Types.ObjectId,
    role: string,
  ): Promise<ProjectDocument | null> {
    return this.projectModel.findOneAndUpdate(
      { _id: projectId, 'teamMembers.employeeId': employeeId },
      { $set: { 'teamMembers.$.role': role } },
      { new: true },
    ).populate('projectManagerId clientId teamMembers.employeeId').exec();
  }

  async updateTeamMemberAllocation(
    projectId: string | Types.ObjectId,
    employeeId: string | Types.ObjectId,
    allocatedHours: number,
  ): Promise<ProjectDocument | null> {
    return this.projectModel.findOneAndUpdate(
      { _id: projectId, 'teamMembers.employeeId': employeeId },
      { $set: { 'teamMembers.$.allocatedHours': allocatedHours } },
      { new: true },
    ).populate('projectManagerId clientId teamMembers.employeeId').exec();
  }

  async updateProgress(
    projectId: string | Types.ObjectId,
    progressPercentage: number,
  ): Promise<ProjectDocument | null> {
    return this.projectModel.findByIdAndUpdate(
      projectId,
      { progressPercentage },
      { new: true },
    ).exec();
  }

  async updateStatus(
    projectId: string | Types.ObjectId,
    status: ProjectStatus,
  ): Promise<ProjectDocument | null> {
    const updateData: any = { status };
    
    if (status === ProjectStatus.ACTIVE && !updateData.actualStartDate) {
      updateData.actualStartDate = new Date();
    }
    
    if (status === ProjectStatus.COMPLETED) {
      updateData.actualEndDate = new Date();
      updateData.progressPercentage = 100;
    }

    return this.projectModel.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true },
    ).populate('projectManagerId clientId').exec();
  }

  async addMilestone(
    projectId: string | Types.ObjectId,
    milestone: any,
  ): Promise<ProjectDocument | null> {
    return this.projectModel.findByIdAndUpdate(
      projectId,
      { $push: { milestones: milestone } },
      { new: true },
    ).exec();
  }

  async updateMilestone(
    projectId: string | Types.ObjectId,
    milestoneIndex: number,
    milestone: any,
  ): Promise<ProjectDocument | null> {
    return this.projectModel.findByIdAndUpdate(
      projectId,
      { $set: { [`milestones.${milestoneIndex}`]: milestone } },
      { new: true },
    ).exec();
  }

  async getProjectStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    overdue: number;
    byStatus: Record<ProjectStatus, number>;
    byPriority: Record<ProjectPriority, number>;
    averageProgress: number;
  }> {
    const today = new Date();
    
    const [
      total,
      active,
      completed,
      overdue,
      statusStats,
      priorityStats,
      progressStats,
    ] = await Promise.all([
      this.count({ archivedAt: { $exists: false } }),
      this.count({ status: ProjectStatus.ACTIVE, archivedAt: { $exists: false } }),
      this.count({ status: ProjectStatus.COMPLETED, archivedAt: { $exists: false } }),
      this.count({
        endDate: { $lt: today },
        status: { $nin: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED] },
        archivedAt: { $exists: false },
      }),
      this.projectModel.aggregate([
        { $match: { archivedAt: { $exists: false } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).exec(),
      this.projectModel.aggregate([
        { $match: { archivedAt: { $exists: false } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]).exec(),
      this.projectModel.aggregate([
        { $match: { archivedAt: { $exists: false } } },
        { $group: { _id: null, averageProgress: { $avg: '$progressPercentage' } } },
      ]).exec(),
    ]);

    const byStatus = Object.values(ProjectStatus).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<ProjectStatus, number>);

    statusStats.forEach(stat => {
      byStatus[stat._id] = stat.count;
    });

    const byPriority = Object.values(ProjectPriority).reduce((acc, priority) => {
      acc[priority] = 0;
      return acc;
    }, {} as Record<ProjectPriority, number>);

    priorityStats.forEach(stat => {
      byPriority[stat._id] = stat.count;
    });

    const averageProgress = progressStats[0]?.averageProgress || 0;

    return {
      total,
      active,
      completed,
      overdue,
      byStatus,
      byPriority,
      averageProgress,
    };
  }

  async getResourceAllocation(): Promise<Array<{
    employeeId: string;
    totalAllocatedHours: number;
    activeProjects: number;
  }>> {
    return this.projectModel.aggregate([
      { $match: { status: ProjectStatus.ACTIVE, archivedAt: { $exists: false } } },
      { $unwind: '$teamMembers' },
      { $match: { 'teamMembers.isActive': true } },
      {
        $group: {
          _id: '$teamMembers.employeeId',
          totalAllocatedHours: { $sum: '$teamMembers.allocatedHours' },
          activeProjects: { $sum: 1 },
        },
      },
      {
        $project: {
          employeeId: '$_id',
          totalAllocatedHours: 1,
          activeProjects: 1,
          _id: 0,
        },
      },
      { $sort: { totalAllocatedHours: -1 } },
    ]).exec();
  }
}
