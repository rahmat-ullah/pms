// User and Employee schemas
export * from './user.schema';
export * from './employee.schema';

// Project schema
export * from './project.schema';

// Catalog schemas
export {
  Skill as CatalogSkill,
  SkillDocument as CatalogSkillDocument,
  SkillSchema,
  Department,
  DepartmentDocument,
  DepartmentSchema,
  Role,
  RoleDocument,
  RoleSchema,
  Location,
  LocationDocument,
  LocationSchema,
  SkillCategory,
  SkillLevel,
} from './catalog.schema';

// Audit logging schema
export * from './audit-log.schema';

// Schema collection for easy registration
import { UserSchema } from './user.schema';
import { EmployeeSchema } from './employee.schema';
import { ProjectSchema } from './project.schema';
import { SkillSchema, DepartmentSchema, RoleSchema, LocationSchema } from './catalog.schema';
import { AuditLogSchema } from './audit-log.schema';
import { FileMetadataSchema } from '../../storage/schemas/file-metadata.schema';

export const DatabaseSchemas = [
  { name: 'User', schema: UserSchema },
  { name: 'Employee', schema: EmployeeSchema },
  { name: 'Project', schema: ProjectSchema },
  { name: 'CatalogSkill', schema: SkillSchema },
  { name: 'Department', schema: DepartmentSchema },
  { name: 'Role', schema: RoleSchema },
  { name: 'Location', schema: LocationSchema },
  { name: 'AuditLog', schema: AuditLogSchema },
  { name: 'FileMetadata', schema: FileMetadataSchema },
];
