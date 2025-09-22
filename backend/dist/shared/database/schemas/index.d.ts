export * from './user.schema';
export * from './employee.schema';
export * from './project.schema';
export { Skill as CatalogSkill, SkillDocument as CatalogSkillDocument, SkillSchema, Department, DepartmentDocument, DepartmentSchema, Role, RoleDocument, RoleSchema, Location, LocationDocument, LocationSchema, SkillCategory, SkillLevel, } from './catalog.schema';
export * from './audit-log.schema';
export declare const DatabaseSchemas: ({
    name: string;
    schema: import("mongoose").Schema<import("./user.schema").User, import("mongoose").Model<import("./user.schema").User, any, any, any, import("mongoose").Document<unknown, any, import("./user.schema").User, any, {}> & import("./user.schema").User & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, import("./user.schema").User, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<import("./user.schema").User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<import("./user.schema").User> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
} | {
    name: string;
    schema: import("mongoose").Schema<import("./employee.schema").Employee, import("mongoose").Model<import("./employee.schema").Employee, any, any, any, import("mongoose").Document<unknown, any, import("./employee.schema").Employee, any, {}> & import("./employee.schema").Employee & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, import("./employee.schema").Employee, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<import("./employee.schema").Employee>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<import("./employee.schema").Employee> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
} | {
    name: string;
    schema: import("mongoose").Schema<import("./project.schema").Project, import("mongoose").Model<import("./project.schema").Project, any, any, any, import("mongoose").Document<unknown, any, import("./project.schema").Project, any, {}> & import("./project.schema").Project & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, import("./project.schema").Project, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<import("./project.schema").Project>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<import("./project.schema").Project> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
} | {
    name: string;
    schema: import("mongoose").Schema<import("./catalog.schema").Skill, import("mongoose").Model<import("./catalog.schema").Skill, any, any, any, import("mongoose").Document<unknown, any, import("./catalog.schema").Skill, any, {}> & import("./catalog.schema").Skill & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, import("./catalog.schema").Skill, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<import("./catalog.schema").Skill>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<import("./catalog.schema").Skill> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
} | {
    name: string;
    schema: import("mongoose").Schema<import("./catalog.schema").Department, import("mongoose").Model<import("./catalog.schema").Department, any, any, any, import("mongoose").Document<unknown, any, import("./catalog.schema").Department, any, {}> & import("./catalog.schema").Department & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, import("./catalog.schema").Department, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<import("./catalog.schema").Department>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<import("./catalog.schema").Department> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
} | {
    name: string;
    schema: import("mongoose").Schema<import("./catalog.schema").Role, import("mongoose").Model<import("./catalog.schema").Role, any, any, any, import("mongoose").Document<unknown, any, import("./catalog.schema").Role, any, {}> & import("./catalog.schema").Role & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, import("./catalog.schema").Role, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<import("./catalog.schema").Role>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<import("./catalog.schema").Role> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
} | {
    name: string;
    schema: import("mongoose").Schema<import("./catalog.schema").Location, import("mongoose").Model<import("./catalog.schema").Location, any, any, any, import("mongoose").Document<unknown, any, import("./catalog.schema").Location, any, {}> & import("./catalog.schema").Location & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, import("./catalog.schema").Location, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<import("./catalog.schema").Location>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<import("./catalog.schema").Location> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
} | {
    name: string;
    schema: import("mongoose").Schema<import("./audit-log.schema").AuditLog, import("mongoose").Model<import("./audit-log.schema").AuditLog, any, any, any, import("mongoose").Document<unknown, any, import("./audit-log.schema").AuditLog, any, {}> & import("./audit-log.schema").AuditLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, import("./audit-log.schema").AuditLog, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<import("./audit-log.schema").AuditLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<import("./audit-log.schema").AuditLog> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
} | {
    name: string;
    schema: import("mongoose").Schema<import("../../storage/schemas/file-metadata.schema").FileMetadata, import("mongoose").Model<import("../../storage/schemas/file-metadata.schema").FileMetadata, any, any, any, import("mongoose").Document<unknown, any, import("../../storage/schemas/file-metadata.schema").FileMetadata, any, {}> & import("../../storage/schemas/file-metadata.schema").FileMetadata & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, import("../../storage/schemas/file-metadata.schema").FileMetadata, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<import("../../storage/schemas/file-metadata.schema").FileMetadata>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<import("../../storage/schemas/file-metadata.schema").FileMetadata> & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
})[];
