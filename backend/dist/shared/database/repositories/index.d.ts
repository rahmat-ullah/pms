export * from './base.repository';
export * from './user.repository';
export * from './employee.repository';
export * from './project.repository';
import { UserRepository } from './user.repository';
import { EmployeeRepository } from './employee.repository';
import { ProjectRepository } from './project.repository';
export declare const DatabaseRepositories: (typeof UserRepository | typeof EmployeeRepository | typeof ProjectRepository)[];
