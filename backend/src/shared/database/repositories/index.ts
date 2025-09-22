// Base repository
export * from './base.repository';

// Entity repositories
export * from './user.repository';
export * from './employee.repository';
export * from './project.repository';

// Repository collection for easy registration
import { UserRepository } from './user.repository';
import { EmployeeRepository } from './employee.repository';
import { ProjectRepository } from './project.repository';

export const DatabaseRepositories = [
  UserRepository,
  EmployeeRepository,
  ProjectRepository,
];
