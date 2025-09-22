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
exports.LocationSchema = exports.RoleSchema = exports.DepartmentSchema = exports.SkillSchema = exports.Location = exports.Role = exports.Department = exports.Skill = exports.SkillLevel = exports.SkillCategory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const class_transformer_1 = require("class-transformer");
var SkillCategory;
(function (SkillCategory) {
    SkillCategory["TECHNICAL"] = "technical";
    SkillCategory["SOFT_SKILLS"] = "soft_skills";
    SkillCategory["LANGUAGE"] = "language";
    SkillCategory["CERTIFICATION"] = "certification";
    SkillCategory["DOMAIN_KNOWLEDGE"] = "domain_knowledge";
})(SkillCategory || (exports.SkillCategory = SkillCategory = {}));
var SkillLevel;
(function (SkillLevel) {
    SkillLevel["BEGINNER"] = "beginner";
    SkillLevel["INTERMEDIATE"] = "intermediate";
    SkillLevel["ADVANCED"] = "advanced";
    SkillLevel["EXPERT"] = "expert";
})(SkillLevel || (exports.SkillLevel = SkillLevel = {}));
let Skill = class Skill {
};
exports.Skill = Skill;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.toString()),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Skill.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Skill.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Skill.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: SkillCategory,
        required: true,
    }),
    __metadata("design:type", String)
], Skill.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], Skill.prototype, "aliases", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], Skill.prototype, "relatedSkills", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Boolean,
        default: true,
    }),
    __metadata("design:type", Boolean)
], Skill.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
    }),
    __metadata("design:type", Number)
], Skill.prototype, "sortOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], Skill.prototype, "metadata", void 0);
exports.Skill = Skill = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'skills',
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], Skill);
let Department = class Department {
};
exports.Department = Department;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.toString()),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Department.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Department.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    }),
    __metadata("design:type", String)
], Department.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Department.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Employee',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Department.prototype, "managerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Department',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Department.prototype, "parentDepartmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
    }),
    __metadata("design:type", String)
], Department.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
    }),
    __metadata("design:type", Number)
], Department.prototype, "budgetAllocation", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Boolean,
        default: true,
    }),
    __metadata("design:type", Boolean)
], Department.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
    }),
    __metadata("design:type", Number)
], Department.prototype, "sortOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], Department.prototype, "metadata", void 0);
exports.Department = Department = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'departments',
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], Department);
let Role = class Role {
};
exports.Role = Role;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.toString()),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Role.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Role.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Department',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Role.prototype, "departmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive'],
        required: true,
    }),
    __metadata("design:type", String)
], Role.prototype, "level", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        required: true,
        min: 0,
    }),
    __metadata("design:type", Number)
], Role.prototype, "minSalary", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        required: true,
        min: 0,
    }),
    __metadata("design:type", Number)
], Role.prototype, "maxSalary", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], Role.prototype, "requiredSkills", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], Role.prototype, "preferredSkills", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], Role.prototype, "responsibilities", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
        min: 0,
    }),
    __metadata("design:type", Number)
], Role.prototype, "minExperience", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Boolean,
        default: true,
    }),
    __metadata("design:type", Boolean)
], Role.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
    }),
    __metadata("design:type", Number)
], Role.prototype, "sortOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], Role.prototype, "metadata", void 0);
exports.Role = Role = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'roles',
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], Role);
let Location = class Location {
};
exports.Location = Location;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.toString()),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Location.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Location.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    }),
    __metadata("design:type", String)
], Location.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['office', 'remote', 'hybrid', 'client_site'],
        required: true,
    }),
    __metadata("design:type", String)
], Location.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Location.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Location.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Location.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Location.prototype, "timezone", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 0,
    }),
    __metadata("design:type", Number)
], Location.prototype, "capacity", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Boolean,
        default: true,
    }),
    __metadata("design:type", Boolean)
], Location.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], Location.prototype, "metadata", void 0);
exports.Location = Location = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'locations',
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], Location);
exports.SkillSchema = mongoose_1.SchemaFactory.createForClass(Skill);
exports.DepartmentSchema = mongoose_1.SchemaFactory.createForClass(Department);
exports.RoleSchema = mongoose_1.SchemaFactory.createForClass(Role);
exports.LocationSchema = mongoose_1.SchemaFactory.createForClass(Location);
exports.SkillSchema.index({ name: 1 }, { unique: true });
exports.SkillSchema.index({ category: 1 });
exports.SkillSchema.index({ isActive: 1 });
exports.SkillSchema.index({ sortOrder: 1 });
exports.SkillSchema.index({ 'name': 'text', 'description': 'text', 'aliases': 'text' });
exports.DepartmentSchema.index({ name: 1 }, { unique: true });
exports.DepartmentSchema.index({ code: 1 }, { unique: true });
exports.DepartmentSchema.index({ managerId: 1 });
exports.DepartmentSchema.index({ parentDepartmentId: 1 });
exports.DepartmentSchema.index({ isActive: 1 });
exports.DepartmentSchema.index({ sortOrder: 1 });
exports.RoleSchema.index({ title: 1 }, { unique: true });
exports.RoleSchema.index({ departmentId: 1 });
exports.RoleSchema.index({ level: 1 });
exports.RoleSchema.index({ isActive: 1 });
exports.RoleSchema.index({ sortOrder: 1 });
exports.RoleSchema.index({ requiredSkills: 1 });
exports.LocationSchema.index({ name: 1 }, { unique: true });
exports.LocationSchema.index({ code: 1 }, { unique: true });
exports.LocationSchema.index({ type: 1 });
exports.LocationSchema.index({ city: 1 });
exports.LocationSchema.index({ country: 1 });
exports.LocationSchema.index({ isActive: 1 });
//# sourceMappingURL=catalog.schema.js.map