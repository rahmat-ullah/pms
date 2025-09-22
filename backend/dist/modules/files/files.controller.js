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
exports.FilesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const files_service_1 = require("./files.service");
const file_dto_1 = require("../../shared/storage/dto/file.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_schema_1 = require("../../shared/database/schemas/user.schema");
let FilesController = class FilesController {
    constructor(filesService) {
        this.filesService = filesService;
    }
    async generateUploadUrl(generateUploadUrlDto, user) {
        return this.filesService.generateUploadUrl(generateUploadUrlDto, user.id);
    }
    async completeUpload(id, user) {
        return this.filesService.completeUpload(id, user.id);
    }
    async findAll(queryDto, user) {
        const userId = this.hasAdminAccess(user.role) ? undefined : user.id;
        return this.filesService.findAll(queryDto, userId);
    }
    async getStats(user) {
        const userId = this.hasAdminAccess(user.role) ? undefined : user.id;
        return this.filesService.getStats(userId);
    }
    async getMyFiles(queryDto, user) {
        return this.filesService.findAll(queryDto, user.id);
    }
    async findOne(id, user) {
        const file = await this.filesService.findOne(id);
        if (!this.hasAdminAccess(user.role) && file.uploadedBy !== user.id && !file.isPublic) {
            throw new common_1.ForbiddenException('Access denied to this file');
        }
        return file;
    }
    async generateDownloadUrl(id, user) {
        const file = await this.filesService.findOne(id);
        if (!this.hasAdminAccess(user.role) && file.uploadedBy !== user.id && !file.isPublic) {
            throw new common_1.ForbiddenException('Access denied to this file');
        }
        return this.filesService.generateDownloadUrl(id, user.id);
    }
    async update(id, updateDto, user) {
        const file = await this.filesService.findOne(id);
        if (!this.hasAdminAccess(user.role) && file.uploadedBy !== user.id) {
            throw new common_1.ForbiddenException('Access denied to update this file');
        }
        if (!this.hasAdminAccess(user.role)) {
            const allowedFields = ['description', 'tags', 'isPublic'];
            const filteredUpdate = Object.keys(updateDto)
                .filter(key => allowedFields.includes(key))
                .reduce((obj, key) => {
                obj[key] = updateDto[key];
                return obj;
            }, {});
            return this.filesService.update(id, filteredUpdate);
        }
        return this.filesService.update(id, updateDto);
    }
    async remove(id, user) {
        const file = await this.filesService.findOne(id);
        if (!this.hasAdminAccess(user.role) && file.uploadedBy !== user.id) {
            throw new common_1.ForbiddenException('Access denied to delete this file');
        }
        await this.filesService.remove(id, user.id);
    }
    async restore(id) {
        return this.filesService.restore(id);
    }
    async permanentDelete(id) {
        await this.filesService.permanentDelete(id);
    }
    async cleanupExpiredFiles() {
        const deletedCount = await this.filesService.cleanupExpiredFiles();
        return { deletedCount };
    }
    async cleanupOrphanedFiles() {
        const deletedCount = await this.filesService.cleanupOrphanedFiles();
        return { deletedCount };
    }
    hasAdminAccess(role) {
        return [user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER].includes(role);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate pre-signed upload URL' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Upload URL generated successfully', type: file_dto_1.UploadUrlResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file parameters' }),
    (0, swagger_1.ApiConsumes)('application/json'),
    openapi.ApiResponse({ status: 201, type: require("../../shared/storage/dto/file.dto").UploadUrlResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_dto_1.GenerateUploadUrlDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "generateUploadUrl", null);
__decorate([
    (0, common_1.Post)(':id/complete-upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark file upload as complete' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upload completed successfully', type: file_dto_1.FileMetadataDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: require("../../shared/storage/dto/file.dto").FileMetadataDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "completeUpload", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get files with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Files retrieved successfully', type: file_dto_1.FileListResponseDto }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'fileType', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'tags', required: false, type: [String] }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    (0, swagger_1.ApiQuery)({ name: 'includeDeleted', required: false, type: Boolean }),
    openapi.ApiResponse({ status: 200, type: require("../../shared/storage/dto/file.dto").FileListResponseDto }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_dto_1.FileQueryDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File statistics retrieved successfully', type: file_dto_1.FileStatsDto }),
    openapi.ApiResponse({ status: 200, type: require("../../shared/storage/dto/file.dto").FileStatsDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('my-files'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user files' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User files retrieved successfully', type: file_dto_1.FileListResponseDto }),
    openapi.ApiResponse({ status: 200, type: require("../../shared/storage/dto/file.dto").FileListResponseDto }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_dto_1.FileQueryDto, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getMyFiles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file metadata by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File metadata retrieved successfully', type: file_dto_1.FileMetadataDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    openapi.ApiResponse({ status: 200, type: require("../../shared/storage/dto/file.dto").FileMetadataDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/download-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate download URL for file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Download URL generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "generateDownloadUrl", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update file metadata' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File updated successfully', type: file_dto_1.FileMetadataDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    openapi.ApiResponse({ status: 200, type: require("../../shared/storage/dto/file.dto").FileMetadataDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete file (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'File deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Restore deleted file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File restored successfully', type: file_dto_1.FileMetadataDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    openapi.ApiResponse({ status: 201, type: require("../../shared/storage/dto/file.dto").FileMetadataDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "restore", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete file' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'File permanently deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "permanentDelete", null);
__decorate([
    (0, common_1.Post)('cleanup/expired'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Cleanup expired files' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Expired files cleaned up' }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "cleanupExpiredFiles", null);
__decorate([
    (0, common_1.Post)('cleanup/orphaned'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Cleanup orphaned files' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Orphaned files cleaned up' }),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "cleanupOrphanedFiles", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map