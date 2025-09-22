import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginationResult } from './base.repository';
import { Employee, EmployeeDocument, EmploymentType, EmploymentStatus } from '../schemas/employee.schema';

export interface EmployeeSearchOptions extends PaginationOptions {
  department?: string;
  position?: string;
  employmentType?: EmploymentType;
  employmentStatus?: EmploymentStatus;
  managerId?: string;
  skills?: string[];
  searchTerm?: string;
  salaryRange?: { min?: number; max?: number };
}

@Injectable()
export class EmployeeRepository extends BaseRepository<EmployeeDocument> {
  constructor(@InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>) {
    super(employeeModel);
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<EmployeeDocument | null> {
    return this.employeeModel.findOne({ userId }).populate('userId managerId').exec();
  }

  async findByUserIdWithPopulation(userId: string | Types.ObjectId): Promise<EmployeeDocument | null> {
    return this.employeeModel
      .findOne({ userId })
      .populate({
        path: 'userId',
        select: 'email firstName lastName profileImage',
      })
      .populate({
        path: 'managerId',
        select: 'employeeId userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName',
        },
      })
      .exec();
  }

  async findByEmployeeId(employeeId: string): Promise<EmployeeDocument | null> {
    return this.employeeModel.findOne({ employeeId }).populate('userId managerId').exec();
  }

  async findByEmployeeIdWithPopulation(employeeId: string): Promise<EmployeeDocument | null> {
    return this.employeeModel
      .findOne({ employeeId })
      .populate({
        path: 'userId',
        select: 'email firstName lastName profileImage',
      })
      .populate({
        path: 'managerId',
        select: 'employeeId userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName',
        },
      })
      .exec();
  }

  async findByIdWithPopulation(id: string | Types.ObjectId): Promise<EmployeeDocument | null> {
    return this.employeeModel
      .findById(id)
      .populate({
        path: 'userId',
        select: 'email firstName lastName profileImage',
      })
      .populate({
        path: 'managerId',
        select: 'employeeId userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName',
        },
      })
      .exec();
  }

  async searchEmployees(options: EmployeeSearchOptions): Promise<PaginationResult<EmployeeDocument>> {
    const {
      department,
      position,
      employmentType,
      employmentStatus,
      managerId,
      skills,
      searchTerm,
      salaryRange,
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
    } = options;

    const filter: any = {};

    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }

    if (position) {
      filter.position = { $regex: position, $options: 'i' };
    }

    if (employmentType) {
      filter.employmentType = employmentType;
    }

    if (employmentStatus) {
      filter.employmentStatus = employmentStatus;
    }

    if (managerId) {
      filter.managerId = managerId;
    }

    if (skills && skills.length > 0) {
      filter['skills.name'] = { $in: skills };
    }

    if (salaryRange) {
      filter.salary = {};
      if (salaryRange.min !== undefined) {
        filter.salary.$gte = salaryRange.min;
      }
      if (salaryRange.max !== undefined) {
        filter.salary.$lte = salaryRange.max;
      }
    }

    if (searchTerm) {
      filter.$or = [
        { employeeId: { $regex: searchTerm, $options: 'i' } },
        { department: { $regex: searchTerm, $options: 'i' } },
        { position: { $regex: searchTerm, $options: 'i' } },
        { 'skills.name': { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const result = await this.findWithPagination(filter, { page, limit, sort });
    
    // Populate user data for each employee
    await this.employeeModel.populate(result.data, { path: 'userId managerId' });
    
    return result;
  }

  async findByDepartment(department: string): Promise<EmployeeDocument[]> {
    return this.employeeModel.find({
      department: { $regex: department, $options: 'i' },
      employmentStatus: EmploymentStatus.ACTIVE,
    }).populate('userId managerId').exec();
  }

  async findByManager(managerId: string | Types.ObjectId): Promise<EmployeeDocument[]> {
    return this.employeeModel.find({
      managerId,
      employmentStatus: EmploymentStatus.ACTIVE,
    }).populate('userId managerId').exec();
  }

  async findBySkills(skills: string[]): Promise<EmployeeDocument[]> {
    return this.employeeModel.find({
      'skills.name': { $in: skills },
      employmentStatus: EmploymentStatus.ACTIVE,
    }).populate('userId').exec();
  }

  async findBySkillLevel(skill: string, level: string): Promise<EmployeeDocument[]> {
    return this.employeeModel.find({
      skills: {
        $elemMatch: {
          name: { $regex: skill, $options: 'i' },
          level: level,
        },
      },
      employmentStatus: EmploymentStatus.ACTIVE,
    }).populate('userId').exec();
  }

  async findActiveEmployees(): Promise<EmployeeDocument[]> {
    return this.employeeModel.find({
      employmentStatus: EmploymentStatus.ACTIVE,
    }).populate('userId managerId').exec();
  }

  async findEmployeesHiredInRange(startDate: Date, endDate: Date): Promise<EmployeeDocument[]> {
    return this.employeeModel.find({
      hireDate: { $gte: startDate, $lte: endDate },
    }).populate('userId').exec();
  }

  async updateSkills(
    employeeId: string | Types.ObjectId,
    skills: any[],
  ): Promise<EmployeeDocument | null> {
    return this.employeeModel.findByIdAndUpdate(
      employeeId,
      { skills },
      { new: true },
    ).populate('userId').exec();
  }



  async updateSalary(
    employeeId: string | Types.ObjectId,
    salary: number,
    currency?: string,
  ): Promise<EmployeeDocument | null> {
    const updateData: any = { salary };
    if (currency) {
      updateData.currency = currency;
    }

    return this.employeeModel.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true },
    ).populate('userId').exec();
  }

  async updateManager(
    employeeId: string | Types.ObjectId,
    managerId: Types.ObjectId | null,
  ): Promise<EmployeeDocument | null> {
    return this.employeeModel.findByIdAndUpdate(
      employeeId,
      { managerId },
      { new: true },
    ).populate('userId managerId').exec();
  }

  async updateEmploymentStatus(
    employeeId: string | Types.ObjectId,
    status: EmploymentStatus,
    terminationDate?: Date,
  ): Promise<EmployeeDocument | null> {
    const updateData: any = { employmentStatus: status };
    
    if (status === EmploymentStatus.TERMINATED && terminationDate) {
      updateData.terminationDate = terminationDate;
    }

    return this.employeeModel.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true },
    ).populate('userId').exec();
  }

  async getEmployeeStats(): Promise<{
    total: number;
    active: number;
    byDepartment: Record<string, number>;
    byEmploymentType: Record<EmploymentType, number>;
    averageSalary: number;
    totalSalaryExpense: number;
  }> {
    const [
      total,
      active,
      departmentStats,
      typeStats,
      salaryStats,
    ] = await Promise.all([
      this.count(),
      this.count({ employmentStatus: EmploymentStatus.ACTIVE }),
      this.employeeModel.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]).exec(),
      this.employeeModel.aggregate([
        { $group: { _id: '$employmentType', count: { $sum: 1 } } },
      ]).exec(),
      this.employeeModel.aggregate([
        {
          $match: { employmentStatus: EmploymentStatus.ACTIVE },
        },
        {
          $group: {
            _id: null,
            averageSalary: { $avg: '$salary' },
            totalSalary: { $sum: '$salary' },
          },
        },
      ]).exec(),
    ]);

    const byDepartment: Record<string, number> = {};
    departmentStats.forEach(stat => {
      byDepartment[stat._id] = stat.count;
    });

    const byEmploymentType = Object.values(EmploymentType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<EmploymentType, number>);

    typeStats.forEach(stat => {
      byEmploymentType[stat._id] = stat.count;
    });

    const averageSalary = salaryStats[0]?.averageSalary || 0;
    const totalSalaryExpense = salaryStats[0]?.totalSalary || 0;

    return {
      total,
      active,
      byDepartment,
      byEmploymentType,
      averageSalary,
      totalSalaryExpense,
    };
  }

  async getDepartmentStats(): Promise<any[]> {
    return this.employeeModel.aggregate([
      {
        $match: {
          employmentStatus: { $ne: EmploymentStatus.TERMINATED },
        },
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          averageSalary: { $avg: '$salary' },
          totalSalary: { $sum: '$salary' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
  }

  async addSkill(employeeId: string, skill: any, updatedBy: string): Promise<EmployeeDocument> {
    return this.employeeModel
      .findByIdAndUpdate(
        employeeId,
        {
          $push: { skills: skill },
          updatedBy: new Types.ObjectId(updatedBy),
        },
        { new: true }
      )
      .exec();
  }

  async removeSkill(employeeId: string, skillName: string, updatedBy: string): Promise<EmployeeDocument> {
    return this.employeeModel
      .findByIdAndUpdate(
        employeeId,
        {
          $pull: { skills: { name: skillName } },
          updatedBy: new Types.ObjectId(updatedBy),
        },
        { new: true }
      )
      .exec();
  }

  async addWorkExperience(employeeId: string, experience: any, updatedBy: string): Promise<EmployeeDocument> {
    return this.employeeModel
      .findByIdAndUpdate(
        employeeId,
        {
          $push: { workExperience: experience },
          updatedBy: new Types.ObjectId(updatedBy),
        },
        { new: true }
      )
      .exec();
  }

  async addEducation(employeeId: string, education: any, updatedBy: string): Promise<EmployeeDocument> {
    return this.employeeModel
      .findByIdAndUpdate(
        employeeId,
        {
          $push: { education: education },
          updatedBy: new Types.ObjectId(updatedBy),
        },
        { new: true }
      )
      .exec();
  }

  async findUpcomingAnniversaries(days: number = 30): Promise<EmployeeDocument[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.employeeModel.aggregate([
      {
        $match: {
          employmentStatus: EmploymentStatus.ACTIVE,
        },
      },
      {
        $addFields: {
          anniversaryThisYear: {
            $dateFromParts: {
              year: today.getFullYear(),
              month: { $month: '$hireDate' },
              day: { $dayOfMonth: '$hireDate' },
            },
          },
        },
      },
      {
        $match: {
          anniversaryThisYear: {
            $gte: today,
            $lte: futureDate,
          },
        },
      },
      {
        $sort: { anniversaryThisYear: 1 },
      },
    ]).exec();
  }

  async getSkillsDistribution(): Promise<Array<{ skill: string; count: number }>> {
    return this.employeeModel.aggregate([
      { $match: { employmentStatus: EmploymentStatus.ACTIVE } },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills.name',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          skill: '$_id',
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]).exec();
  }
}
