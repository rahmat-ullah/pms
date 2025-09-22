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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSchema = exports.Project = exports.TeamMemberRole = exports.ProjectPriority = exports.ProjectStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const class_transformer_1 = require("class-transformer");
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["PLANNING"] = "planning";
    ProjectStatus["ACTIVE"] = "active";
    ProjectStatus["ON_HOLD"] = "on_hold";
    ProjectStatus["COMPLETED"] = "completed";
    ProjectStatus["CANCELLED"] = "cancelled";
    ProjectStatus["ARCHIVED"] = "archived";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var ProjectPriority;
(function (ProjectPriority) {
    ProjectPriority["LOW"] = "low";
    ProjectPriority["MEDIUM"] = "medium";
    ProjectPriority["HIGH"] = "high";
    ProjectPriority["CRITICAL"] = "critical";
})(ProjectPriority || (exports.ProjectPriority = ProjectPriority = {}));
var TeamMemberRole;
(function (TeamMemberRole) {
    TeamMemberRole["PROJECT_MANAGER"] = "project_manager";
    TeamMemberRole["TECH_LEAD"] = "tech_lead";
    TeamMemberRole["SENIOR_DEVELOPER"] = "senior_developer";
    TeamMemberRole["DEVELOPER"] = "developer";
    TeamMemberRole["JUNIOR_DEVELOPER"] = "junior_developer";
    TeamMemberRole["QA_ENGINEER"] = "qa_engineer";
    TeamMemberRole["DESIGNER"] = "designer";
    TeamMemberRole["BUSINESS_ANALYST"] = "business_analyst";
    TeamMemberRole["DEVOPS_ENGINEER"] = "devops_engineer";
    TeamMemberRole["CONSULTANT"] = "consultant";
})(TeamMemberRole || (exports.TeamMemberRole = TeamMemberRole = {}));
let Project = class Project {
    get isActive() {
        return this.status === ProjectStatus.ACTIVE;
    }
    get isOverdue() {
        return new Date() > this.endDate && this.status !== ProjectStatus.COMPLETED;
    }
    get totalTeamMembers() {
        return this.teamMembers.filter(member => member.isActive).length;
    }
    get totalAllocatedHours() {
        return this.teamMembers
            .filter(member => member.isActive)
            .reduce((total, member) => total + member.allocatedHours, 0);
    }
};
exports.Project = Project;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.toString()),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
        maxlength: 200,
    }),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    }),
    __metadata("design:type", String)
], Project.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
        maxlength: 1000,
    }),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ProjectStatus,
        default: ProjectStatus.PLANNING,
    }),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ProjectPriority,
        default: ProjectPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], Project.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Employee',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "projectManagerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "clientId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        required: true,
    }),
    __metadata("design:type", Date)
], Project.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        required: true,
    }),
    __metadata("design:type", Date)
], Project.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: null,
    }),
    __metadata("design:type", Date)
], Project.prototype, "actualStartDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: null,
    }),
    __metadata("design:type", Date)
], Project.prototype, "actualEndDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [Object],
        default: [],
    }),
    __metadata("design:type", Array)
], Project.prototype, "teamMembers", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], Project.prototype, "technologies", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], Project.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [Object],
        default: [],
    }),
    __metadata("design:type", Array)
], Project.prototype, "milestones", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: null,
    }),
    __metadata("design:type", Object)
], Project.prototype, "budget", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [Object],
        default: [],
    }),
    __metadata("design:type", Array)
], Project.prototype, "risks", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    }),
    __metadata("design:type", Number)
], Project.prototype, "progressPercentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
    }),
    __metadata("design:type", Number)
], Project.prototype, "estimatedHours", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
    }),
    __metadata("design:type", Number)
], Project.prototype, "actualHours", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
    }),
    __metadata("design:type", String)
], Project.prototype, "repositoryUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
    }),
    __metadata("design:type", String)
], Project.prototype, "documentationUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
    }),
    __metadata("design:type", String)
], Project.prototype, "deploymentUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], Project.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "updatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: null,
    }),
    __metadata("design:type", Date)
], Project.prototype, "archivedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "archivedBy", void 0);
exports.Project = Project = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'projects',
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], Project);
exports.ProjectSchema = mongoose_1.SchemaFactory.createForClass(Project);
exports.ProjectSchema.index({ code: 1 }, { unique: true });
exports.ProjectSchema.index({ status: 1 });
exports.ProjectSchema.index({ priority: 1 });
exports.ProjectSchema.index({ projectManagerId: 1 });
exports.ProjectSchema.index({ clientId: 1 });
exports.ProjectSchema.index({ startDate: 1 });
exports.ProjectSchema.index({ endDate: 1 });
exports.ProjectSchema.index({ 'teamMembers.employeeId': 1 });
exports.ProjectSchema.index({ technologies: 1 });
exports.ProjectSchema.index({ tags: 1 });
exports.ProjectSchema.index({ createdAt: -1 });
exports.ProjectSchema.index({
    'name': 'text',
    'code': 'text',
    'description': 'text',
    'technologies': 'text',
    'tags': 'text',
});
exports.ProjectSchema.index({ status: 1, priority: 1 });
exports.ProjectSchema.index({ projectManagerId: 1, status: 1 });
exports.ProjectSchema.virtual('isActive').get(function () {
    return this.status === ProjectStatus.ACTIVE;
});
exports.ProjectSchema.virtual('isOverdue').get(function () {
    return new Date() > this.endDate && this.status !== ProjectStatus.COMPLETED;
});
exports.ProjectSchema.set('toJSON', { virtuals: true });
exports.ProjectSchema.set('toObject', { virtuals: true });
//# sourceMappingURL=project.schema.js.map