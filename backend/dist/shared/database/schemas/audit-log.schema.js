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
exports.AuditLogSchema = exports.AuditLog = exports.AuditEntityType = exports.AuditAction = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const class_transformer_1 = require("class-transformer");
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "create";
    AuditAction["READ"] = "read";
    AuditAction["UPDATE"] = "update";
    AuditAction["DELETE"] = "delete";
    AuditAction["LOGIN"] = "login";
    AuditAction["LOGOUT"] = "logout";
    AuditAction["EXPORT"] = "export";
    AuditAction["IMPORT"] = "import";
    AuditAction["APPROVE"] = "approve";
    AuditAction["REJECT"] = "reject";
    AuditAction["ARCHIVE"] = "archive";
    AuditAction["RESTORE"] = "restore";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var AuditEntityType;
(function (AuditEntityType) {
    AuditEntityType["USER"] = "user";
    AuditEntityType["EMPLOYEE"] = "employee";
    AuditEntityType["PROJECT"] = "project";
    AuditEntityType["SKILL"] = "skill";
    AuditEntityType["DEPARTMENT"] = "department";
    AuditEntityType["ROLE"] = "role";
    AuditEntityType["LOCATION"] = "location";
    AuditEntityType["ATTENDANCE"] = "attendance";
    AuditEntityType["LEAVE"] = "leave";
    AuditEntityType["PAYROLL"] = "payroll";
    AuditEntityType["FILE"] = "file";
    AuditEntityType["AUTH"] = "auth";
    AuditEntityType["SYSTEM"] = "system";
})(AuditEntityType || (exports.AuditEntityType = AuditEntityType = {}));
let AuditLog = class AuditLog {
};
exports.AuditLog = AuditLog;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value.toString()),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AuditLog.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: AuditAction,
        required: true,
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: AuditEntityType,
        required: true,
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "entityType", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "entityId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'User',
        default: null,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AuditLog.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        default: 'system',
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "userEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [Object],
        default: [],
    }),
    __metadata("design:type", Array)
], AuditLog.prototype, "changes", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: null,
    }),
    __metadata("design:type", Object)
], AuditLog.prototype, "previousData", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: null,
    }),
    __metadata("design:type", Object)
], AuditLog.prototype, "newData", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], AuditLog.prototype, "context", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: () => ({}),
    }),
    __metadata("design:type", Object)
], AuditLog.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
    }),
    __metadata("design:type", String)
], AuditLog.prototype, "severity", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], AuditLog.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], AuditLog.prototype, "isSystemGenerated", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: Date.now,
        index: true,
    }),
    __metadata("design:type", Date)
], AuditLog.prototype, "timestamp", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'audit_logs',
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], AuditLog);
exports.AuditLogSchema = mongoose_1.SchemaFactory.createForClass(AuditLog);
exports.AuditLogSchema.index({ action: 1 });
exports.AuditLogSchema.index({ entityType: 1 });
exports.AuditLogSchema.index({ entityId: 1 });
exports.AuditLogSchema.index({ userId: 1 });
exports.AuditLogSchema.index({ userEmail: 1 });
exports.AuditLogSchema.index({ timestamp: -1 });
exports.AuditLogSchema.index({ severity: 1 });
exports.AuditLogSchema.index({ tags: 1 });
exports.AuditLogSchema.index({ isSystemGenerated: 1 });
exports.AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
exports.AuditLogSchema.index({ userId: 1, timestamp: -1 });
exports.AuditLogSchema.index({ action: 1, entityType: 1 });
exports.AuditLogSchema.index({ timestamp: -1, severity: 1 });
exports.AuditLogSchema.index({
    'description': 'text',
    'userEmail': 'text',
    'tags': 'text',
});
//# sourceMappingURL=audit-log.schema.js.map