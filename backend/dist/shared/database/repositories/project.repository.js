"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_repository_1 = require("./base.repository");
const project_schema_1 = require("../schemas/project.schema");
let ProjectRepository = class ProjectRepository extends base_repository_1.BaseRepository {
    constructor(projectModel) {
        super(projectModel);
        this.projectModel = projectModel;
    }
    async findByCode(code) {
        return this.projectModel.findOne({ code }).populate('projectManagerId clientId teamMembers.employeeId').exec();
    }
    async searchProjects(options) {
        const { status, priority, projectManagerId, clientId, technologies, tags, searchTerm, dateRange, includeArchived = false, page = 1, limit = 10, sort = { createdAt: -1 }, } = options;
        const filter = {};
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
        await this.projectModel.populate(result.data, {
            path: 'projectManagerId clientId teamMembers.employeeId',
        });
        return result;
    }
    async findByStatus(status) {
        return this.projectModel.find({
            status,
            archivedAt: { $exists: false },
        }).populate('projectManagerId clientId').exec();
    }
    async findByProjectManager(projectManagerId) {
        return this.projectModel.find({
            projectManagerId,
            archivedAt: { $exists: false },
        }).populate('projectManagerId clientId').exec();
    }
    async findByClient(clientId) {
        return this.projectModel.find({
            clientId,
            archivedAt: { $exists: false },
        }).populate('projectManagerId clientId').exec();
    }
    async findByEmployee(employeeId) {
        return this.projectModel.find({
            'teamMembers.employeeId': employeeId,
            'teamMembers.isActive': true,
            archivedAt: { $exists: false },
        }).populate('projectManagerId clientId teamMembers.employeeId').exec();
    }
    async findActiveProjects() {
        return this.projectModel.find({
            status: project_schema_1.ProjectStatus.ACTIVE,
            archivedAt: { $exists: false },
        }).populate('projectManagerId clientId').exec();
    }
    async findOverdueProjects() {
        const today = new Date();
        return this.projectModel.find({
            endDate: { $lt: today },
            status: { $nin: [project_schema_1.ProjectStatus.COMPLETED, project_schema_1.ProjectStatus.CANCELLED] },
            archivedAt: { $exists: false },
        }).populate('projectManagerId clientId').exec();
    }
    async findProjectsEndingSoon(days = 7) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        return this.projectModel.find({
            endDate: { $gte: today, $lte: futureDate },
            status: project_schema_1.ProjectStatus.ACTIVE,
            archivedAt: { $exists: false },
        }).populate('projectManagerId clientId').exec();
    }
    async addTeamMember(projectId, teamMember) {
        return this.projectModel.findByIdAndUpdate(projectId, { $push: { teamMembers: teamMember } }, { new: true }).populate('projectManagerId clientId teamMembers.employeeId').exec();
    }
    async removeTeamMember(projectId, employeeId) {
        return this.projectModel.findByIdAndUpdate(projectId, { $pull: { teamMembers: { employeeId } } }, { new: true }).populate('projectManagerId clientId teamMembers.employeeId').exec();
    }
    async updateTeamMemberRole(projectId, employeeId, role) {
        return this.projectModel.findOneAndUpdate({ _id: projectId, 'teamMembers.employeeId': employeeId }, { $set: { 'teamMembers.$.role': role } }, { new: true }).populate('projectManagerId clientId teamMembers.employeeId').exec();
    }
    async updateTeamMemberAllocation(projectId, employeeId, allocatedHours) {
        return this.projectModel.findOneAndUpdate({ _id: projectId, 'teamMembers.employeeId': employeeId }, { $set: { 'teamMembers.$.allocatedHours': allocatedHours } }, { new: true }).populate('projectManagerId clientId teamMembers.employeeId').exec();
    }
    async updateProgress(projectId, progressPercentage) {
        return this.projectModel.findByIdAndUpdate(projectId, { progressPercentage }, { new: true }).exec();
    }
    async updateStatus(projectId, status) {
        const updateData = { status };
        if (status === project_schema_1.ProjectStatus.ACTIVE && !updateData.actualStartDate) {
            updateData.actualStartDate = new Date();
        }
        if (status === project_schema_1.ProjectStatus.COMPLETED) {
            updateData.actualEndDate = new Date();
            updateData.progressPercentage = 100;
        }
        return this.projectModel.findByIdAndUpdate(projectId, updateData, { new: true }).populate('projectManagerId clientId').exec();
    }
    async addMilestone(projectId, milestone) {
        return this.projectModel.findByIdAndUpdate(projectId, { $push: { milestones: milestone } }, { new: true }).exec();
    }
    async updateMilestone(projectId, milestoneIndex, milestone) {
        return this.projectModel.findByIdAndUpdate(projectId, { $set: { [`milestones.${milestoneIndex}`]: milestone } }, { new: true }).exec();
    }
    async getProjectStats() {
        const today = new Date();
        const [total, active, completed, overdue, statusStats, priorityStats, progressStats,] = await Promise.all([
            this.count({ archivedAt: { $exists: false } }),
            this.count({ status: project_schema_1.ProjectStatus.ACTIVE, archivedAt: { $exists: false } }),
            this.count({ status: project_schema_1.ProjectStatus.COMPLETED, archivedAt: { $exists: false } }),
            this.count({
                endDate: { $lt: today },
                status: { $nin: [project_schema_1.ProjectStatus.COMPLETED, project_schema_1.ProjectStatus.CANCELLED] },
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
        const byStatus = Object.values(project_schema_1.ProjectStatus).reduce((acc, status) => {
            acc[status] = 0;
            return acc;
        }, {});
        statusStats.forEach(stat => {
            byStatus[stat._id] = stat.count;
        });
        const byPriority = Object.values(project_schema_1.ProjectPriority).reduce((acc, priority) => {
            acc[priority] = 0;
            return acc;
        }, {});
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
    async getResourceAllocation() {
        return this.projectModel.aggregate([
            { $match: { status: project_schema_1.ProjectStatus.ACTIVE, archivedAt: { $exists: false } } },
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
};
exports.ProjectRepository = ProjectRepository;
exports.ProjectRepository = ProjectRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProjectRepository);
//# sourceMappingURL=project.repository.js.map