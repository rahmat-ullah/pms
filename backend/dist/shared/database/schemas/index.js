"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSchemas = exports.SkillLevel = exports.SkillCategory = exports.LocationSchema = exports.Location = exports.RoleSchema = exports.Role = exports.DepartmentSchema = exports.Department = exports.SkillSchema = exports.CatalogSkill = void 0;
__exportStar(require("./user.schema"), exports);
__exportStar(require("./employee.schema"), exports);
__exportStar(require("./project.schema"), exports);
var catalog_schema_1 = require("./catalog.schema");
Object.defineProperty(exports, "CatalogSkill", { enumerable: true, get: function () { return catalog_schema_1.Skill; } });
Object.defineProperty(exports, "SkillSchema", { enumerable: true, get: function () { return catalog_schema_1.SkillSchema; } });
Object.defineProperty(exports, "Department", { enumerable: true, get: function () { return catalog_schema_1.Department; } });
Object.defineProperty(exports, "DepartmentSchema", { enumerable: true, get: function () { return catalog_schema_1.DepartmentSchema; } });
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return catalog_schema_1.Role; } });
Object.defineProperty(exports, "RoleSchema", { enumerable: true, get: function () { return catalog_schema_1.RoleSchema; } });
Object.defineProperty(exports, "Location", { enumerable: true, get: function () { return catalog_schema_1.Location; } });
Object.defineProperty(exports, "LocationSchema", { enumerable: true, get: function () { return catalog_schema_1.LocationSchema; } });
Object.defineProperty(exports, "SkillCategory", { enumerable: true, get: function () { return catalog_schema_1.SkillCategory; } });
Object.defineProperty(exports, "SkillLevel", { enumerable: true, get: function () { return catalog_schema_1.SkillLevel; } });
__exportStar(require("./audit-log.schema"), exports);
const user_schema_1 = require("./user.schema");
const employee_schema_1 = require("./employee.schema");
const project_schema_1 = require("./project.schema");
const catalog_schema_2 = require("./catalog.schema");
const audit_log_schema_1 = require("./audit-log.schema");
const file_metadata_schema_1 = require("../../storage/schemas/file-metadata.schema");
exports.DatabaseSchemas = [
    { name: 'User', schema: user_schema_1.UserSchema },
    { name: 'Employee', schema: employee_schema_1.EmployeeSchema },
    { name: 'Project', schema: project_schema_1.ProjectSchema },
    { name: 'CatalogSkill', schema: catalog_schema_2.SkillSchema },
    { name: 'Department', schema: catalog_schema_2.DepartmentSchema },
    { name: 'Role', schema: catalog_schema_2.RoleSchema },
    { name: 'Location', schema: catalog_schema_2.LocationSchema },
    { name: 'AuditLog', schema: audit_log_schema_1.AuditLogSchema },
    { name: 'FileMetadata', schema: file_metadata_schema_1.FileMetadataSchema },
];
//# sourceMappingURL=index.js.map