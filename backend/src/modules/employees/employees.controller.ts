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
  HttpStatus,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto, EmployeeResponseDto } from './dto/employee.dto';
import { UserRole } from '../../shared/database/schemas/user.schema';
import { EmploymentStatus } from '../../shared/database/schemas/employee.schema';
import { FilesService } from '../files/files.service';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create a new employee profile' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Employee profile created successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Employee profile already exists or employee ID is taken',
  })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @CurrentUser() currentUser: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.create(createEmployeeDto, currentUser.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Get all employees with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employees retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        employees: {
          type: 'array',
          items: { $ref: '#/components/schemas/EmployeeResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(@Query() query: EmployeeQueryDto) {
    return this.employeesService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get employee statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee statistics retrieved successfully',
  })
  async getEmployeeStats() {
    return this.employeesService.getEmployeeStats();
  }

  @Get('departments/stats')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get department statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Department statistics retrieved successfully',
  })
  async getDepartmentStats() {
    return this.employeesService.getDepartmentStats();
  }

  @Get('search/skills')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Search employees by skills' })
  @ApiQuery({ name: 'skills', type: [String], description: 'Array of skill names' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employees with specified skills retrieved successfully',
  })
  async searchBySkills(
    @Query('skills') skills: string[],
    @Query() query: EmployeeQueryDto,
  ) {
    const skillsArray = Array.isArray(skills) ? skills : [skills];
    return this.employeesService.searchBySkills(skillsArray, query);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get employee profile by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee profile retrieved successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee profile not found',
  })
  async findByUserId(@Param('userId') userId: string): Promise<EmployeeResponseDto> {
    return this.employeesService.findByUserId(userId);
  }

  @Get('employee-id/:employeeId')
  @ApiOperation({ summary: 'Get employee by employee ID' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee retrieved successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  async findByEmployeeId(@Param('employeeId') employeeId: string): Promise<EmployeeResponseDto> {
    return this.employeesService.findByEmployeeId(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee retrieved successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  async findById(@Param('id') id: string): Promise<EmployeeResponseDto> {
    return this.employeesService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update employee profile' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employee updated successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Employee not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @CurrentUser() currentUser: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.update(id, updateEmployeeDto, currentUser.id);
  }

  @Patch(':id/employment-status')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update employee employment status' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { enum: Object.values(EmploymentStatus) },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employment status updated successfully',
    type: EmployeeResponseDto,
  })
  async updateEmploymentStatus(
    @Param('id') id: string,
    @Body('status') status: EmploymentStatus,
    @CurrentUser() currentUser: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.updateEmploymentStatus(id, status, currentUser.id);
  }

  @Post(':id/profile-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload employee profile image' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiBody({
    description: 'Profile image file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile image uploaded successfully',
  })
  async uploadProfileImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @CurrentUser() currentUser: any,
  ) {
    // Upload file to storage
    const uploadResult = await this.filesService.uploadFile(
      file,
      `employees/${id}/profile`,
      currentUser.id,
    );

    // Update employee with profile image URL
    await this.employeesService.update(
      id,
      { metadata: { profileImageUrl: uploadResult.url } },
      currentUser.id,
    );

    return {
      message: 'Profile image uploaded successfully',
      url: uploadResult.url,
      fileId: uploadResult.id,
    };
  }

  @Post(':id/skills')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Add skill to employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
        yearsOfExperience: { type: 'number' },
        certifications: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Skill added successfully',
    type: EmployeeResponseDto,
  })
  async addSkill(
    @Param('id') id: string,
    @Body() skill: any,
    @CurrentUser() currentUser: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.addSkill(id, skill, currentUser.id);
  }

  @Delete(':id/skills/:skillName')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Remove skill from employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiParam({ name: 'skillName', description: 'Skill name to remove' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Skill removed successfully',
    type: EmployeeResponseDto,
  })
  async removeSkill(
    @Param('id') id: string,
    @Param('skillName') skillName: string,
    @CurrentUser() currentUser: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.removeSkill(id, skillName, currentUser.id);
  }

  @Post(':id/work-experience')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Add work experience to employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        company: { type: 'string' },
        position: { type: 'string' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        description: { type: 'string' },
        technologies: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Work experience added successfully',
    type: EmployeeResponseDto,
  })
  async addWorkExperience(
    @Param('id') id: string,
    @Body() experience: any,
    @CurrentUser() currentUser: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.addWorkExperience(id, experience, currentUser.id);
  }

  @Post(':id/education')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Add education to employee' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        institution: { type: 'string' },
        degree: { type: 'string' },
        fieldOfStudy: { type: 'string' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        gpa: { type: 'number' },
        description: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Education added successfully',
    type: EmployeeResponseDto,
  })
  async addEducation(
    @Param('id') id: string,
    @Body() education: any,
    @CurrentUser() currentUser: any,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.addEducation(id, education, currentUser.id);
  }
}
