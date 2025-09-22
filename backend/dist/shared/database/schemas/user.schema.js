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
exports.UserSchema = exports.User = exports.UserStatus = exports.UserRole = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const class_transformer_1 = require("class-transformer");
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["HR_MANAGER"] = "hr_manager";
    UserRole["PROJECT_MANAGER"] = "project_manager";
    UserRole["TEAM_LEAD"] = "team_lead";
    UserRole["EMPLOYEE"] = "employee";
    UserRole["CONTRACTOR"] = "contractor";
    UserRole["VIEWER"] = "viewer";
    UserRole["AUDITOR"] = "auditor";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["PENDING"] = "pending";
    UserStatus["ARCHIVED"] = "archived";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
let User = class User {
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    get isActive() {
        return this.status === UserStatus.ACTIVE;
    }
    get isEmailVerified() {
        return !!this.emailVerifiedAt;
    }
};
exports.User = User;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.toString()),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        minlength: 8,
        select: false,
    }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: UserRole,
        default: UserRole.EMPLOYEE,
        required: true,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: UserStatus,
        default: UserStatus.PENDING,
        required: true,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({
            canManageUsers: false,
            canManageEmployees: false,
            canManageProjects: false,
            canViewReports: false,
            canManageAttendance: false,
            canApproveLeave: false,
            canManagePayroll: false,
            canAccessFinance: false,
            canManageSettings: false,
        }),
    }),
    __metadata("design:type", Object)
], User.prototype, "permissions", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Employee',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "employeeProfile", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
    }),
    __metadata("design:type", String)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
    }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: null,
    }),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: null,
    }),
    __metadata("design:type", Date)
], User.prototype, "emailVerifiedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
        select: false,
    }),
    __metadata("design:type", String)
], User.prototype, "emailVerificationToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: null,
        select: false,
    }),
    __metadata("design:type", String)
], User.prototype, "passwordResetToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: null,
        select: false,
    }),
    __metadata("design:type", Date)
], User.prototype, "passwordResetExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
        select: false,
    }),
    __metadata("design:type", Array)
], User.prototype, "refreshTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], User.prototype, "preferences", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], User.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "updatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: null,
    }),
    __metadata("design:type", Date)
], User.prototype, "archivedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], User.prototype, "archivedBy", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'users',
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                delete ret.password;
                delete ret.refreshTokens;
                return ret;
            },
        },
    })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ email: 1 }, { unique: true });
exports.UserSchema.index({ role: 1 });
exports.UserSchema.index({ status: 1 });
exports.UserSchema.index({ employeeProfile: 1 });
exports.UserSchema.index({ createdAt: -1 });
exports.UserSchema.index({ lastLoginAt: -1 });
exports.UserSchema.index({ 'firstName': 'text', 'lastName': 'text', 'email': 'text' });
exports.UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.UserSchema.set('toJSON', { virtuals: true });
exports.UserSchema.set('toObject', { virtuals: true });
//# sourceMappingURL=user.schema.js.map