import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from '../schemas/employee.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { EmploymentStatus } from '../schemas/employee.schema';
import { BaseSeeder } from './base.seeder';

@Injectable()
export class EmployeeSeeder extends BaseSeeder<EmployeeDocument> {
  constructor(
    @InjectModel(Employee.name) employeeModel: Model<EmployeeDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(employeeModel);
  }

  getCollectionName(): string {
    return 'employees';
  }

  async getData(): Promise<Partial<EmployeeDocument>[]> {
    // Get all users to create employee profiles for them
    const users = await this.userModel.find({}).exec();
    
    const departments = [
      'Engineering', 'Product Management', 'Design', 'Marketing', 
      'Sales', 'Human Resources', 'Finance', 'Operations', 'Customer Support'
    ];

    const positions = {
      'Engineering': ['Software Engineer', 'Senior Software Engineer', 'Lead Engineer', 'Engineering Manager', 'DevOps Engineer', 'QA Engineer'],
      'Product Management': ['Product Manager', 'Senior Product Manager', 'Product Owner', 'Product Director'],
      'Design': ['UI/UX Designer', 'Senior Designer', 'Design Lead', 'Visual Designer'],
      'Marketing': ['Marketing Manager', 'Content Manager', 'SEO Specialist', 'Marketing Director'],
      'Sales': ['Sales Representative', 'Account Manager', 'Sales Manager', 'Business Development'],
      'Human Resources': ['HR Specialist', 'HR Manager', 'Recruiter', 'HR Director'],
      'Finance': ['Financial Analyst', 'Accountant', 'Finance Manager', 'CFO'],
      'Operations': ['Operations Manager', 'Project Coordinator', 'Operations Director'],
      'Customer Support': ['Support Specialist', 'Support Manager', 'Customer Success Manager']
    };

    const skills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C#', 'Go',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'MongoDB', 'PostgreSQL', 'Redis',
      'Project Management', 'Agile', 'Scrum', 'Leadership', 'Communication',
      'UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping',
      'Digital Marketing', 'SEO', 'Content Creation', 'Analytics',
      'Sales', 'CRM', 'Negotiation', 'Customer Relations',
      'Financial Analysis', 'Budgeting', 'Accounting', 'Excel',
      'HR Management', 'Recruitment', 'Employee Relations', 'Training'
    ];

    const employees: Partial<EmployeeDocument>[] = [];

    for (const user of users) {
      const department = this.randomChoice(departments) as string;
      const position = this.randomChoice(positions[department]) as string;
      const employeeSkills = this.randomChoices(skills, this.randomNumber(3, 8));
      const hireDate = this.randomDate(
        new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000), // 5 years ago
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      );

      const employee: Partial<EmployeeDocument> = {
        userId: user._id,
        employeeId: `EMP${String(employees.length + 1).padStart(4, '0')}`,
        department,
        position,
        employmentType: this.randomChoice(['full_time', 'part_time', 'contract', 'intern']) as any,
        employmentStatus: this.randomBoolean(0.95) ? EmploymentStatus.ACTIVE :
          this.randomChoice([EmploymentStatus.ON_LEAVE, EmploymentStatus.TERMINATED]),
        hireDate,
        salary: this.generateSalary(position, department),
        currency: 'USD',
        skills: employeeSkills.map(skill => ({
          name: skill,
          level: this.randomChoice(['beginner', 'intermediate', 'advanced', 'expert']),
          yearsOfExperience: this.randomNumber(1, 10),
          certifications: this.randomBoolean(0.3) ? [this.generateCertification(skill)] : []
        })),
        workExperience: this.generateWorkExperience(),
        education: this.generateEducation(),
        createdAt: hireDate,
        updatedAt: new Date(),
      };

      employees.push(employee);
    }

    return employees;
  }

  private generatePhoneNumber(): string {
    const areaCode = this.randomNumber(200, 999);
    const exchange = this.randomNumber(200, 999);
    const number = this.randomNumber(1000, 9999);
    return `+1-${areaCode}-${exchange}-${number}`;
  }

  private generateAddress(): string {
    const streetNumbers = this.randomNumber(100, 9999);
    const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Cedar Ln', 'Maple Dr'];
    return `${streetNumbers} ${this.randomChoice(streetNames)}`;
  }

  private generateZipCode(): string {
    return String(this.randomNumber(10000, 99999));
  }

  private generateEmergencyContactName(): string {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Mary'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    return `${this.randomChoice(firstNames)} ${this.randomChoice(lastNames)}`;
  }

  private generateEmergencyEmail(): string {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const username = `contact${this.randomNumber(100, 999)}`;
    return `${username}@${this.randomChoice(domains)}`;
  }

  private generateSalary(position: string, department: string): number {
    const baseSalaries: Record<string, number> = {
      'Software Engineer': 80000,
      'Senior Software Engineer': 120000,
      'Lead Engineer': 150000,
      'Engineering Manager': 180000,
      'Product Manager': 130000,
      'Senior Product Manager': 160000,
      'UI/UX Designer': 85000,
      'Senior Designer': 110000,
      'Marketing Manager': 90000,
      'Sales Representative': 60000,
      'HR Specialist': 65000,
      'Financial Analyst': 75000,
    };

    const baseSalary = baseSalaries[position] || 70000;
    const variation = this.randomNumber(-10000, 15000);
    return Math.max(50000, baseSalary + variation);
  }

  private generateCertification(skill: string): string {
    const certifications = {
      'AWS': 'AWS Certified Solutions Architect',
      'Azure': 'Microsoft Azure Fundamentals',
      'JavaScript': 'JavaScript Developer Certification',
      'Project Management': 'PMP Certification',
      'Scrum': 'Certified Scrum Master',
    };
    return certifications[skill] || `${skill} Professional Certification`;
  }

  private generateWorkExperience(): any[] {
    const experienceCount = this.randomNumber(1, 4);
    const experience = [];

    for (let i = 0; i < experienceCount; i++) {
      const startDate = this.randomDate(
        new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 1 * 365 * 24 * 60 * 60 * 1000)
      );
      const endDate = this.randomDate(startDate, new Date());

      experience.push({
        company: this.randomChoice(['TechCorp', 'InnovateLabs', 'DataSystems', 'CloudWorks', 'DevSolutions']),
        position: this.randomChoice(['Developer', 'Analyst', 'Coordinator', 'Specialist', 'Associate']),
        startDate,
        endDate,
        description: 'Responsible for various technical and business tasks.',
        achievements: ['Improved system performance', 'Led team initiatives', 'Delivered projects on time']
      });
    }

    return experience;
  }

  private generateEducation(): any[] {
    return [{
      institution: this.randomChoice(['State University', 'Tech Institute', 'Business College', 'Engineering School']),
      degree: this.randomChoice(['Bachelor of Science', 'Bachelor of Arts', 'Master of Science', 'Master of Business Administration']),
      fieldOfStudy: this.randomChoice(['Computer Science', 'Business Administration', 'Engineering', 'Marketing', 'Finance']),
      graduationYear: this.randomNumber(2010, 2022),
      gpa: (this.randomNumber(300, 400) / 100).toFixed(2)
    }];
  }

  private generateGoals(): string[] {
    const goals = [
      'Improve technical skills',
      'Lead more projects',
      'Mentor junior team members',
      'Complete certification',
      'Increase productivity by 20%'
    ];
    return this.randomChoices(goals, this.randomNumber(2, 4));
  }

  private generateAchievements(): string[] {
    const achievements = [
      'Employee of the month',
      'Successfully delivered major project',
      'Improved team efficiency',
      'Completed advanced training',
      'Received client appreciation'
    ];
    return this.randomChoices(achievements, this.randomNumber(1, 3));
  }
}
