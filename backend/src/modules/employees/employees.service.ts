import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { EmployeeRepository } from '../../shared/database/repositories/employee.repository';
import { UserRepository } from '../../shared/database/repositories/user.repository';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto, EmployeeResponseDto } from './dto/employee.dto';
import { Employee, EmploymentStatus } from '../../shared/database/schemas/employee.schema';
import { UserRole } from '../../shared/database/schemas/user.schema';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto, currentUserId: string): Promise<EmployeeResponseDto> {
    // Validate user exists and doesn't already have an employee profile
    const user = await this.userRepository.findById(createEmployeeDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingEmployee = await this.employeeRepository.findByUserId(createEmployeeDto.userId);
    if (existingEmployee) {
      throw new ConflictException('Employee profile already exists for this user');
    }

    // Validate unique employee ID
    const existingEmployeeId = await this.employeeRepository.findByEmployeeId(createEmployeeDto.employeeId);
    if (existingEmployeeId) {
      throw new ConflictException('Employee ID already exists');
    }

    // Validate manager exists if provided
    if (createEmployeeDto.managerId) {
      const manager = await this.employeeRepository.findById(createEmployeeDto.managerId);
      if (!manager) {
        throw new NotFoundException('Manager not found');
      }
    }

    // Create employee profile
    const employeeData = {
      ...createEmployeeDto,
      userId: new Types.ObjectId(createEmployeeDto.userId),
      managerId: createEmployeeDto.managerId ? new Types.ObjectId(createEmployeeDto.managerId) : undefined,
      hireDate: new Date(createEmployeeDto.hireDate),
      dateOfBirth: createEmployeeDto.dateOfBirth ? new Date(createEmployeeDto.dateOfBirth) : undefined,
      createdBy: new Types.ObjectId(currentUserId),
      updatedBy: new Types.ObjectId(currentUserId),
    };

    const employee = await this.employeeRepository.create(employeeData);

    // Update user with employee profile reference
    await this.userRepository.update(createEmployeeDto.userId, {
      employeeProfile: employee._id,
      role: UserRole.EMPLOYEE, // Ensure user has employee role
      updatedBy: new Types.ObjectId(currentUserId),
    });

    return this.mapToResponseDto(employee);
  }

  async findAll(query: EmployeeQueryDto): Promise<{
    employees: EmployeeResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter = this.buildSearchFilter(query);
    const result = await this.employeeRepository.findWithPagination(filter, {
      page: query.page,
      limit: query.limit,
      sort: { [query.sortBy]: query.sortOrder === 'desc' ? -1 : 1 },
    });
    const employees = result.data;
    const total = result.total;

    const totalPages = Math.ceil(total / query.limit);

    return {
      employees: employees.map(employee => this.mapToResponseDto(employee)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findByIdWithPopulation(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return this.mapToResponseDto(employee);
  }

  async findByUserId(userId: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findByUserIdWithPopulation(userId);
    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user');
    }
    return this.mapToResponseDto(employee);
  }

  async findByEmployeeId(employeeId: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findByEmployeeIdWithPopulation(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return this.mapToResponseDto(employee);
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, currentUserId: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate employee ID uniqueness if being updated
    if (updateEmployeeDto.employeeId && updateEmployeeDto.employeeId !== employee.employeeId) {
      const existingEmployeeId = await this.employeeRepository.findByEmployeeId(updateEmployeeDto.employeeId);
      if (existingEmployeeId) {
        throw new ConflictException('Employee ID already exists');
      }
    }

    // Validate manager exists if provided
    if (updateEmployeeDto.managerId) {
      const manager = await this.employeeRepository.findById(updateEmployeeDto.managerId);
      if (!manager) {
        throw new NotFoundException('Manager not found');
      }
    }

    const updateData = {
      ...updateEmployeeDto,
      managerId: updateEmployeeDto.managerId ? new Types.ObjectId(updateEmployeeDto.managerId) : undefined,
      hireDate: updateEmployeeDto.hireDate ? new Date(updateEmployeeDto.hireDate) : undefined,
      terminationDate: updateEmployeeDto.terminationDate ? new Date(updateEmployeeDto.terminationDate) : undefined,
      dateOfBirth: updateEmployeeDto.dateOfBirth ? new Date(updateEmployeeDto.dateOfBirth) : undefined,
      updatedBy: new Types.ObjectId(currentUserId),
    };

    const updatedEmployee = await this.employeeRepository.update(id, updateData);
    return this.mapToResponseDto(updatedEmployee);
  }

  async updateEmploymentStatus(id: string, status: EmploymentStatus, currentUserId: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const updateData: any = {
      employmentStatus: status,
      updatedBy: new Types.ObjectId(currentUserId),
    };

    // Set termination date if terminating
    if (status === EmploymentStatus.TERMINATED) {
      updateData.terminationDate = new Date();
    }

    const updatedEmployee = await this.employeeRepository.update(id, updateData);
    return this.mapToResponseDto(updatedEmployee);
  }

  async addSkill(id: string, skill: any, currentUserId: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const updatedEmployee = await this.employeeRepository.addSkill(id, skill, currentUserId);
    return this.mapToResponseDto(updatedEmployee);
  }

  async removeSkill(id: string, skillName: string, currentUserId: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const updatedEmployee = await this.employeeRepository.removeSkill(id, skillName, currentUserId);
    return this.mapToResponseDto(updatedEmployee);
  }

  async addWorkExperience(id: string, experience: any, currentUserId: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const updatedEmployee = await this.employeeRepository.addWorkExperience(id, experience, currentUserId);
    return this.mapToResponseDto(updatedEmployee);
  }

  async addEducation(id: string, education: any, currentUserId: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const updatedEmployee = await this.employeeRepository.addEducation(id, education, currentUserId);
    return this.mapToResponseDto(updatedEmployee);
  }

  async searchBySkills(skills: string[], query: EmployeeQueryDto): Promise<{
    employees: EmployeeResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const searchFilter = {
      ...this.buildSearchFilter(query),
      'skills.name': { $in: skills },
    };

    const result = await this.employeeRepository.findWithPagination(searchFilter, {
      page: query.page,
      limit: query.limit,
      sort: { [query.sortBy]: query.sortOrder === 'desc' ? -1 : 1 },
    });
    const employees = result.data;
    const total = result.total;

    const totalPages = Math.ceil(total / query.limit);

    return {
      employees: employees.map(employee => this.mapToResponseDto(employee)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  async getEmployeeStats(): Promise<any> {
    return this.employeeRepository.getEmployeeStats();
  }

  async getDepartmentStats(): Promise<any> {
    return this.employeeRepository.getDepartmentStats();
  }

  private buildSearchFilter(query: EmployeeQueryDto): any {
    const filter: any = {};

    if (!query.includeTerminated) {
      filter.employmentStatus = { $ne: EmploymentStatus.TERMINATED };
    }

    if (query.search) {
      filter.$or = [
        { employeeId: { $regex: query.search, $options: 'i' } },
        { department: { $regex: query.search, $options: 'i' } },
        { position: { $regex: query.search, $options: 'i' } },
      ];
    }

    if (query.department) {
      filter.department = { $regex: query.department, $options: 'i' };
    }

    if (query.position) {
      filter.position = { $regex: query.position, $options: 'i' };
    }

    if (query.employmentType) {
      filter.employmentType = query.employmentType;
    }

    if (query.employmentStatus) {
      filter.employmentStatus = query.employmentStatus;
    }

    if (query.managerId) {
      filter.managerId = new Types.ObjectId(query.managerId);
    }

    if (query.skills && query.skills.length > 0) {
      filter['skills.name'] = { $in: query.skills };
    }

    return filter;
  }

  private mapToResponseDto(employee: any): EmployeeResponseDto {
    return {
      id: employee._id?.toString() || employee.id,
      userId: employee.userId?.toString(),
      employeeId: employee.employeeId,
      department: employee.department,
      position: employee.position,
      employmentType: employee.employmentType,
      employmentStatus: employee.employmentStatus,
      hireDate: employee.hireDate,
      terminationDate: employee.terminationDate,
      managerId: employee.managerId?.toString(),
      salary: employee.salary,
      currency: employee.currency,
      salaryType: employee.salaryType,
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      nationality: employee.nationality,
      address: employee.address,
      emergencyContacts: employee.emergencyContacts,
      skills: employee.skills,
      workExperience: employee.workExperience,
      education: employee.education,
      certifications: employee.certifications,
      languages: employee.languages,
      bio: employee.bio,
      linkedinProfile: employee.linkedinProfile,
      githubProfile: employee.githubProfile,
      weeklyWorkingHours: employee.weeklyWorkingHours,
      timezone: employee.timezone,
      preferences: employee.preferences,
      metadata: employee.metadata,
      createdBy: employee.createdBy?.toString(),
      updatedBy: employee.updatedBy?.toString(),
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      user: employee.userId && typeof employee.userId === 'object' ? {
        id: employee.userId._id?.toString(),
        email: employee.userId.email,
        firstName: employee.userId.firstName,
        lastName: employee.userId.lastName,
        fullName: employee.userId.fullName,
        profileImage: employee.userId.profileImage,
      } : undefined,
      manager: employee.managerId && typeof employee.managerId === 'object' ? {
        id: employee.managerId._id?.toString(),
        employeeId: employee.managerId.employeeId,
        user: {
          firstName: employee.managerId.userId?.firstName,
          lastName: employee.managerId.userId?.lastName,
          fullName: employee.managerId.userId?.fullName,
        },
      } : undefined,
    };
  }
}
