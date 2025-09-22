import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import {
  GenerateUploadUrlDto,
  UploadUrlResponseDto,
  FileMetadataDto,
  FileQueryDto,
  FileListResponseDto,
  FileStatsDto,
} from '../../shared/storage/dto/file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../shared/database/schemas/user.schema';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Generate pre-signed upload URL' })
  @ApiResponse({ status: 201, description: 'Upload URL generated successfully', type: UploadUrlResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file parameters' })
  @ApiConsumes('application/json')
  async generateUploadUrl(
    @Body() generateUploadUrlDto: GenerateUploadUrlDto,
    @CurrentUser() user: any,
  ): Promise<UploadUrlResponseDto> {
    return this.filesService.generateUploadUrl(generateUploadUrlDto, user.id);
  }

  @Post(':id/complete-upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark file upload as complete' })
  @ApiResponse({ status: 200, description: 'Upload completed successfully', type: FileMetadataDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async completeUpload(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<FileMetadataDto> {
    return this.filesService.completeUpload(id, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get files with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully', type: FileListResponseDto })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'fileType', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  async findAll(
    @Query() queryDto: FileQueryDto,
    @CurrentUser() user: any,
  ): Promise<FileListResponseDto> {
    // Regular users can only see their own files
    const userId = this.hasAdminAccess(user.role) ? undefined : user.id;
    return this.filesService.findAll(queryDto, userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get file statistics' })
  @ApiResponse({ status: 200, description: 'File statistics retrieved successfully', type: FileStatsDto })
  async getStats(@CurrentUser() user: any): Promise<FileStatsDto> {
    // Regular users get their own stats, admins get global stats
    const userId = this.hasAdminAccess(user.role) ? undefined : user.id;
    return this.filesService.getStats(userId);
  }

  @Get('my-files')
  @ApiOperation({ summary: 'Get current user files' })
  @ApiResponse({ status: 200, description: 'User files retrieved successfully', type: FileListResponseDto })
  async getMyFiles(
    @Query() queryDto: FileQueryDto,
    @CurrentUser() user: any,
  ): Promise<FileListResponseDto> {
    return this.filesService.findAll(queryDto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata by ID' })
  @ApiResponse({ status: 200, description: 'File metadata retrieved successfully', type: FileMetadataDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<FileMetadataDto> {
    const file = await this.filesService.findOne(id);
    
    // Check if user has access to this file
    if (!this.hasAdminAccess(user.role) && file.uploadedBy !== user.id && !file.isPublic) {
      throw new ForbiddenException('Access denied to this file');
    }

    return file;
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Generate download URL for file' })
  @ApiResponse({ status: 200, description: 'Download URL generated successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async generateDownloadUrl(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    const file = await this.filesService.findOne(id);
    
    // Check if user has access to this file
    if (!this.hasAdminAccess(user.role) && file.uploadedBy !== user.id && !file.isPublic) {
      throw new ForbiddenException('Access denied to this file');
    }

    return this.filesService.generateDownloadUrl(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update file metadata' })
  @ApiResponse({ status: 200, description: 'File updated successfully', type: FileMetadataDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<FileMetadataDto>,
    @CurrentUser() user: any,
  ): Promise<FileMetadataDto> {
    const file = await this.filesService.findOne(id);
    
    // Check if user has access to update this file
    if (!this.hasAdminAccess(user.role) && file.uploadedBy !== user.id) {
      throw new ForbiddenException('Access denied to update this file');
    }

    // Regular users can only update certain fields
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete file (soft delete)' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    const file = await this.filesService.findOne(id);
    
    // Check if user has access to delete this file
    if (!this.hasAdminAccess(user.role) && file.uploadedBy !== user.id) {
      throw new ForbiddenException('Access denied to delete this file');
    }

    await this.filesService.remove(id, user.id);
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Restore deleted file' })
  @ApiResponse({ status: 200, description: 'File restored successfully', type: FileMetadataDto })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async restore(@Param('id') id: string): Promise<FileMetadataDto> {
    return this.filesService.restore(id);
  }

  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete file' })
  @ApiResponse({ status: 204, description: 'File permanently deleted' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async permanentDelete(@Param('id') id: string): Promise<void> {
    await this.filesService.permanentDelete(id);
  }

  @Post('cleanup/expired')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cleanup expired files' })
  @ApiResponse({ status: 200, description: 'Expired files cleaned up' })
  async cleanupExpiredFiles(): Promise<{ deletedCount: number }> {
    const deletedCount = await this.filesService.cleanupExpiredFiles();
    return { deletedCount };
  }

  @Post('cleanup/orphaned')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cleanup orphaned files' })
  @ApiResponse({ status: 200, description: 'Orphaned files cleaned up' })
  async cleanupOrphanedFiles(): Promise<{ deletedCount: number }> {
    const deletedCount = await this.filesService.cleanupOrphanedFiles();
    return { deletedCount };
  }

  private hasAdminAccess(role: UserRole): boolean {
    return [UserRole.ADMIN, UserRole.PROJECT_MANAGER].includes(role);
  }
}
