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
exports.EmployeeSeeder = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const employee_schema_1 = require("../schemas/employee.schema");
const user_schema_1 = require("../schemas/user.schema");
const employee_schema_2 = require("../schemas/employee.schema");
const base_seeder_1 = require("./base.seeder");
let EmployeeSeeder = class EmployeeSeeder extends base_seeder_1.BaseSeeder {
    constructor(employeeModel, userModel) {
        super(employeeModel);
        this.userModel = userModel;
    }
    getCollectionName() {
        return 'employees';
    }
    async getData() {
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
        const employees = [];
        for (const user of users) {
            const department = this.randomChoice(departments);
            const position = this.randomChoice(positions[department]);
            const employeeSkills = this.randomChoices(skills, this.randomNumber(3, 8));
            const hireDate = this.randomDate(new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000), new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
            const employee = {
                userId: user._id,
                employeeId: `EMP${String(employees.length + 1).padStart(4, '0')}`,
                department,
                position,
                employmentType: this.randomChoice(['full_time', 'part_time', 'contract', 'intern']),
                employmentStatus: this.randomBoolean(0.95) ? employee_schema_2.EmploymentStatus.ACTIVE :
                    this.randomChoice([employee_schema_2.EmploymentStatus.ON_LEAVE, employee_schema_2.EmploymentStatus.TERMINATED]),
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
    generatePhoneNumber() {
        const areaCode = this.randomNumber(200, 999);
        const exchange = this.randomNumber(200, 999);
        const number = this.randomNumber(1000, 9999);
        return `+1-${areaCode}-${exchange}-${number}`;
    }
    generateAddress() {
        const streetNumbers = this.randomNumber(100, 9999);
        const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Cedar Ln', 'Maple Dr'];
        return `${streetNumbers} ${this.randomChoice(streetNames)}`;
    }
    generateZipCode() {
        return String(this.randomNumber(10000, 99999));
    }
    generateEmergencyContactName() {
        const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Mary'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        return `${this.randomChoice(firstNames)} ${this.randomChoice(lastNames)}`;
    }
    generateEmergencyEmail() {
        const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const username = `contact${this.randomNumber(100, 999)}`;
        return `${username}@${this.randomChoice(domains)}`;
    }
    generateSalary(position, department) {
        const baseSalaries = {
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
    generateCertification(skill) {
        const certifications = {
            'AWS': 'AWS Certified Solutions Architect',
            'Azure': 'Microsoft Azure Fundamentals',
            'JavaScript': 'JavaScript Developer Certification',
            'Project Management': 'PMP Certification',
            'Scrum': 'Certified Scrum Master',
        };
        return certifications[skill] || `${skill} Professional Certification`;
    }
    generateWorkExperience() {
        const experienceCount = this.randomNumber(1, 4);
        const experience = [];
        for (let i = 0; i < experienceCount; i++) {
            const startDate = this.randomDate(new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000), new Date(Date.now() - 1 * 365 * 24 * 60 * 60 * 1000));
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
    generateEducation() {
        return [{
                institution: this.randomChoice(['State University', 'Tech Institute', 'Business College', 'Engineering School']),
                degree: this.randomChoice(['Bachelor of Science', 'Bachelor of Arts', 'Master of Science', 'Master of Business Administration']),
                fieldOfStudy: this.randomChoice(['Computer Science', 'Business Administration', 'Engineering', 'Marketing', 'Finance']),
                graduationYear: this.randomNumber(2010, 2022),
                gpa: (this.randomNumber(300, 400) / 100).toFixed(2)
            }];
    }
    generateGoals() {
        const goals = [
            'Improve technical skills',
            'Lead more projects',
            'Mentor junior team members',
            'Complete certification',
            'Increase productivity by 20%'
        ];
        return this.randomChoices(goals, this.randomNumber(2, 4));
    }
    generateAchievements() {
        const achievements = [
            'Employee of the month',
            'Successfully delivered major project',
            'Improved team efficiency',
            'Completed advanced training',
            'Received client appreciation'
        ];
        return this.randomChoices(achievements, this.randomNumber(1, 3));
    }
};
exports.EmployeeSeeder = EmployeeSeeder;
exports.EmployeeSeeder = EmployeeSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], EmployeeSeeder);
//# sourceMappingURL=employee.seeder.js.map