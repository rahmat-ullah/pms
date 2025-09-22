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
exports.EmployeeSchema = exports.Employee = exports.EmploymentStatus = exports.EmploymentType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const class_transformer_1 = require("class-transformer");
var EmploymentType;
(function (EmploymentType) {
    EmploymentType["FULL_TIME"] = "full_time";
    EmploymentType["PART_TIME"] = "part_time";
    EmploymentType["CONTRACT"] = "contract";
    EmploymentType["INTERN"] = "intern";
    EmploymentType["CONSULTANT"] = "consultant";
})(EmploymentType || (exports.EmploymentType = EmploymentType = {}));
var EmploymentStatus;
(function (EmploymentStatus) {
    EmploymentStatus["ACTIVE"] = "active";
    EmploymentStatus["ON_LEAVE"] = "on_leave";
    EmploymentStatus["TERMINATED"] = "terminated";
    EmploymentStatus["RESIGNED"] = "resigned";
    EmploymentStatus["RETIRED"] = "retired";
})(EmploymentStatus || (exports.EmploymentStatus = EmploymentStatus = {}));
let Employee = class Employee {
};
exports.Employee = Employee;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.toString()),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Employee.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Employee.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Employee.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Employee.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], Employee.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: EmploymentType,
        required: true,
    }),
    __metadata("design:type", String)
], Employee.prototype, "employmentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: EmploymentStatus,
        default: EmploymentStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Employee.prototype, "employmentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        required: true,
    }),
    __metadata("design:type", Date)
], Employee.prototype, "hireDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: null,
    }),
    __metadata("design:type", Date)
], Employee.prototype, "terminationDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Employee',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Employee.prototype, "managerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        required: true,
        min: 0,
    }),
    __metadata("design:type", Number)
], Employee.prototype, "salary", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: 'USD',
    }),
    __metadata("design:type", String)
], Employee.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['hourly', 'monthly', 'yearly'],
        default: 'yearly',
    }),
    __metadata("design:type", String)
], Employee.prototype, "salaryType", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: null,
    }),
    __metadata("design:type", Date)
], Employee.prototype, "dateOfBirth", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        default: null,
    }),
    __metadata("design:type", String)
], Employee.prototype, "gender", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
    }),
    __metadata("design:type", String)
], Employee.prototype, "nationality", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: null,
    }),
    __metadata("design:type", Object)
], Employee.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [Object],
        default: [],
    }),
    __metadata("design:type", Array)
], Employee.prototype, "emergencyContacts", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [Object],
        default: [],
    }),
    __metadata("design:type", Array)
], Employee.prototype, "skills", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [Object],
        default: [],
    }),
    __metadata("design:type", Array)
], Employee.prototype, "workExperience", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [Object],
        default: [],
    }),
    __metadata("design:type", Array)
], Employee.prototype, "education", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], Employee.prototype, "certifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], Employee.prototype, "languages", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
    }),
    __metadata("design:type", String)
], Employee.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
    }),
    __metadata("design:type", String)
], Employee.prototype, "linkedinProfile", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
    }),
    __metadata("design:type", String)
], Employee.prototype, "githubProfile", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        default: 40,
        min: 0,
        max: 168,
    }),
    __metadata("design:type", Number)
], Employee.prototype, "weeklyWorkingHours", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: 'UTC',
    }),
    __metadata("design:type", String)
], Employee.prototype, "timezone", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], Employee.prototype, "preferences", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], Employee.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Employee.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Employee.prototype, "updatedBy", void 0);
exports.Employee = Employee = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'employees',
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], Employee);
exports.EmployeeSchema = mongoose_1.SchemaFactory.createForClass(Employee);
exports.EmployeeSchema.index({ userId: 1 }, { unique: true });
exports.EmployeeSchema.index({ employeeId: 1 }, { unique: true });
exports.EmployeeSchema.index({ department: 1 });
exports.EmployeeSchema.index({ position: 1 });
exports.EmployeeSchema.index({ employmentType: 1 });
exports.EmployeeSchema.index({ employmentStatus: 1 });
exports.EmployeeSchema.index({ managerId: 1 });
exports.EmployeeSchema.index({ hireDate: -1 });
exports.EmployeeSchema.index({ 'skills.name': 1 });
exports.EmployeeSchema.index({ 'skills.level': 1 });
exports.EmployeeSchema.index({
    'employeeId': 'text',
    'department': 'text',
    'position': 'text',
    'skills.name': 'text',
});
//# sourceMappingURL=employee.schema.js.map