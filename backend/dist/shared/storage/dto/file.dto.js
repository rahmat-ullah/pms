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
exports.FileStatsDto = exports.FileListResponseDto = exports.FileQueryDto = exports.UploadUrlResponseDto = exports.GenerateUploadUrlDto = exports.FileMetadataDto = exports.UploadFileDto = exports.FileStatus = exports.FileType = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var FileType;
(function (FileType) {
    FileType["IMAGE"] = "image";
    FileType["DOCUMENT"] = "document";
    FileType["SPREADSHEET"] = "spreadsheet";
    FileType["PRESENTATION"] = "presentation";
    FileType["PDF"] = "pdf";
    FileType["ARCHIVE"] = "archive";
    FileType["OTHER"] = "other";
})(FileType || (exports.FileType = FileType = {}));
var FileStatus;
(function (FileStatus) {
    FileStatus["UPLOADING"] = "uploading";
    FileStatus["PROCESSING"] = "processing";
    FileStatus["AVAILABLE"] = "available";
    FileStatus["QUARANTINED"] = "quarantined";
    FileStatus["DELETED"] = "deleted";
})(FileStatus || (exports.FileStatus = FileStatus = {}));
class UploadFileDto {
    constructor() {
        this.isPublic = false;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { filename: { required: true, type: () => String }, mimeType: { required: true, type: () => String }, size: { required: true, type: () => Number, minimum: 1, maximum: 100 * 1024 * 1024 }, fileType: { required: false, enum: require("./file.dto").FileType }, description: { required: false, type: () => String }, tags: { required: false, type: () => [String] }, isPublic: { required: false, type: () => Boolean, default: false } };
    }
}
exports.UploadFileDto = UploadFileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'profile-image.jpg' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadFileDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image/jpeg' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadFileDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1024000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100 * 1024 * 1024),
    __metadata("design:type", Number)
], UploadFileDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: FileType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FileType),
    __metadata("design:type", String)
], UploadFileDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'User profile image' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadFileDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['profile', 'user'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UploadFileDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UploadFileDto.prototype, "isPublic", void 0);
class FileMetadataDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, filename: { required: true, type: () => String }, mimeType: { required: true, type: () => String }, size: { required: true, type: () => Number }, fileType: { required: true, enum: require("./file.dto").FileType }, status: { required: true, enum: require("./file.dto").FileStatus }, description: { required: false, type: () => String }, tags: { required: false, type: () => [String] }, isPublic: { required: true, type: () => Boolean }, uploadedBy: { required: true, type: () => String }, uploadedAt: { required: true, type: () => Date }, lastAccessedAt: { required: false, type: () => Date }, downloadCount: { required: false, type: () => Number }, downloadUrl: { required: false, type: () => String }, downloadUrlExpiresAt: { required: false, type: () => Date } };
    }
}
exports.FileMetadataDto = FileMetadataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], FileMetadataDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'profile-image.jpg' }),
    __metadata("design:type", String)
], FileMetadataDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image/jpeg' }),
    __metadata("design:type", String)
], FileMetadataDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1024000 }),
    __metadata("design:type", Number)
], FileMetadataDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: FileType }),
    __metadata("design:type", String)
], FileMetadataDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: FileStatus }),
    __metadata("design:type", String)
], FileMetadataDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'User profile image' }),
    __metadata("design:type", String)
], FileMetadataDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['profile', 'user'] }),
    __metadata("design:type", Array)
], FileMetadataDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], FileMetadataDto.prototype, "isPublic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], FileMetadataDto.prototype, "uploadedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], FileMetadataDto.prototype, "uploadedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2023-01-01T00:00:00.000Z' }),
    __metadata("design:type", Date)
], FileMetadataDto.prototype, "lastAccessedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    __metadata("design:type", Number)
], FileMetadataDto.prototype, "downloadCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://storage.example.com/files/...' }),
    __metadata("design:type", String)
], FileMetadataDto.prototype, "downloadUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2023-01-01T01:00:00.000Z' }),
    __metadata("design:type", Date)
], FileMetadataDto.prototype, "downloadUrlExpiresAt", void 0);
class GenerateUploadUrlDto {
    constructor() {
        this.isPublic = false;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { filename: { required: true, type: () => String }, mimeType: { required: true, type: () => String }, size: { required: true, type: () => Number, minimum: 1, maximum: 100 * 1024 * 1024 }, fileType: { required: false, enum: require("./file.dto").FileType }, description: { required: false, type: () => String }, tags: { required: false, type: () => [String] }, isPublic: { required: false, type: () => Boolean, default: false } };
    }
}
exports.GenerateUploadUrlDto = GenerateUploadUrlDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'profile-image.jpg' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateUploadUrlDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image/jpeg' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateUploadUrlDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1024000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100 * 1024 * 1024),
    __metadata("design:type", Number)
], GenerateUploadUrlDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: FileType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FileType),
    __metadata("design:type", String)
], GenerateUploadUrlDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'User profile image' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateUploadUrlDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['profile', 'user'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateUploadUrlDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GenerateUploadUrlDto.prototype, "isPublic", void 0);
class UploadUrlResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { fileId: { required: true, type: () => String }, uploadUrl: { required: true, type: () => String }, expiresAt: { required: true, type: () => Date }, headers: { required: true, type: () => Object } };
    }
}
exports.UploadUrlResponseDto = UploadUrlResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], UploadUrlResponseDto.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://storage.example.com/upload/...' }),
    __metadata("design:type", String)
], UploadUrlResponseDto.prototype, "uploadUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T01:00:00.000Z' }),
    __metadata("design:type", Date)
], UploadUrlResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { 'x-amz-meta-file-id': '507f1f77bcf86cd799439011' } }),
    __metadata("design:type", Object)
], UploadUrlResponseDto.prototype, "headers", void 0);
class FileQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'uploadedAt';
        this.sortOrder = 'desc';
        this.includeDeleted = false;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { page: { required: false, type: () => Number, default: 1 }, limit: { required: false, type: () => Number, default: 10 }, search: { required: false, type: () => String }, fileType: { required: false, enum: require("./file.dto").FileType }, status: { required: false, enum: require("./file.dto").FileStatus }, tags: { required: false, type: () => [String] }, sortBy: { required: false, type: () => String, default: "uploadedAt" }, sortOrder: { required: false, type: () => Object, default: "desc" }, includeDeleted: { required: false, type: () => Boolean, default: false } };
    }
}
exports.FileQueryDto = FileQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FileQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FileQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'image' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: FileType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FileType),
    __metadata("design:type", String)
], FileQueryDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: FileStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FileStatus),
    __metadata("design:type", String)
], FileQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['profile'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], FileQueryDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uploadedAt' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'desc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FileQueryDto.prototype, "includeDeleted", void 0);
class FileListResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { data: { required: true, type: () => [require("./file.dto").FileMetadataDto] }, total: { required: true, type: () => Number }, page: { required: true, type: () => Number }, limit: { required: true, type: () => Number }, totalPages: { required: true, type: () => Number }, hasNextPage: { required: true, type: () => Boolean }, hasPrevPage: { required: true, type: () => Boolean } };
    }
}
exports.FileListResponseDto = FileListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [FileMetadataDto] }),
    __metadata("design:type", Array)
], FileListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    __metadata("design:type", Number)
], FileListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], FileListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    __metadata("design:type", Number)
], FileListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10 }),
    __metadata("design:type", Number)
], FileListResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], FileListResponseDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], FileListResponseDto.prototype, "hasPrevPage", void 0);
class FileStatsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { totalFiles: { required: true, type: () => Number }, totalSize: { required: true, type: () => Number }, filesByType: { required: true, type: () => Object }, filesByStatus: { required: true, type: () => Object }, totalDownloads: { required: true, type: () => Number }, averageFileSize: { required: true, type: () => Number } };
    }
}
exports.FileStatsDto = FileStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000 }),
    __metadata("design:type", Number)
], FileStatsDto.prototype, "totalFiles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1073741824 }),
    __metadata("design:type", Number)
], FileStatsDto.prototype, "totalSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { [FileType.IMAGE]: 500, [FileType.DOCUMENT]: 300 } }),
    __metadata("design:type", Object)
], FileStatsDto.prototype, "filesByType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { [FileStatus.AVAILABLE]: 800, [FileStatus.PROCESSING]: 50 } }),
    __metadata("design:type", Object)
], FileStatsDto.prototype, "filesByStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5000 }),
    __metadata("design:type", Number)
], FileStatsDto.prototype, "totalDownloads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 107374182.4 }),
    __metadata("design:type", Number)
], FileStatsDto.prototype, "averageFileSize", void 0);
//# sourceMappingURL=file.dto.js.map