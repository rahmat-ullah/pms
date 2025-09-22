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
exports.FileMetadataSchema = exports.FileMetadata = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const file_dto_1 = require("../dto/file.dto");
let FileMetadata = class FileMetadata {
};
exports.FileMetadata = FileMetadata;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], FileMetadata.prototype, "filename", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], FileMetadata.prototype, "originalFilename", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], FileMetadata.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], FileMetadata.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: file_dto_1.FileType, default: file_dto_1.FileType.OTHER }),
    __metadata("design:type", String)
], FileMetadata.prototype, "fileType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: file_dto_1.FileStatus, default: file_dto_1.FileStatus.UPLOADING }),
    __metadata("design:type", String)
], FileMetadata.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], FileMetadata.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], FileMetadata.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], FileMetadata.prototype, "isPublic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], FileMetadata.prototype, "uploadedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], FileMetadata.prototype, "uploadedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], FileMetadata.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], FileMetadata.prototype, "downloadCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], FileMetadata.prototype, "storageKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], FileMetadata.prototype, "bucket", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], FileMetadata.prototype, "etag", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], FileMetadata.prototype, "versionId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], FileMetadata.prototype, "virusScanStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], FileMetadata.prototype, "virusScanDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], FileMetadata.prototype, "virusScanResult", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], FileMetadata.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], FileMetadata.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], FileMetadata.prototype, "deletedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], FileMetadata.prototype, "expiresAt", void 0);
exports.FileMetadata = FileMetadata = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'file_metadata',
    })
], FileMetadata);
exports.FileMetadataSchema = mongoose_1.SchemaFactory.createForClass(FileMetadata);
exports.FileMetadataSchema.index({ uploadedBy: 1, status: 1 });
exports.FileMetadataSchema.index({ fileType: 1, status: 1 });
exports.FileMetadataSchema.index({ tags: 1 });
exports.FileMetadataSchema.index({ storageKey: 1 }, { unique: true });
exports.FileMetadataSchema.index({ uploadedAt: -1 });
exports.FileMetadataSchema.index({ lastAccessedAt: -1 });
exports.FileMetadataSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.FileMetadataSchema.index({ deletedAt: 1 });
exports.FileMetadataSchema.index({
    filename: 'text',
    originalFilename: 'text',
    description: 'text',
    tags: 'text',
});
exports.FileMetadataSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.storageKey;
        delete ret.bucket;
        delete ret.etag;
        delete ret.versionId;
        return ret;
    },
});
exports.FileMetadataSchema.virtual('downloadUrl').get(function () {
    return undefined;
});
exports.FileMetadataSchema.virtual('downloadUrlExpiresAt').get(function () {
    return undefined;
});
exports.FileMetadataSchema.set('toJSON', { virtuals: true });
//# sourceMappingURL=file-metadata.schema.js.map