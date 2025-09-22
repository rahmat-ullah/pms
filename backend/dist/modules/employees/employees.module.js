"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../shared/database/database.module");
const storage_module_1 = require("../../shared/storage/storage.module");
const files_module_1 = require("../files/files.module");
const employees_controller_1 = require("./employees.controller");
const employees_service_1 = require("./employees.service");
let EmployeesModule = class EmployeesModule {
};
exports.EmployeesModule = EmployeesModule;
exports.EmployeesModule = EmployeesModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, storage_module_1.StorageModule, files_module_1.FilesModule],
        controllers: [employees_controller_1.EmployeesController],
        providers: [employees_service_1.EmployeesService],
        exports: [employees_service_1.EmployeesService],
    })
], EmployeesModule);
//# sourceMappingURL=employees.module.js.map