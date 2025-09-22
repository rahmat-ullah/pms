"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("../schemas/user.schema");
const employee_schema_1 = require("../schemas/employee.schema");
const user_seeder_1 = require("./user.seeder");
const employee_seeder_1 = require("./employee.seeder");
const database_seeder_1 = require("./database.seeder");
const seeder_controller_1 = require("./seeder.controller");
let SeederModule = class SeederModule {
};
exports.SeederModule = SeederModule;
exports.SeederModule = SeederModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
            ]),
        ],
        providers: [
            user_seeder_1.UserSeeder,
            employee_seeder_1.EmployeeSeeder,
            database_seeder_1.DatabaseSeeder,
        ],
        controllers: [seeder_controller_1.SeederController],
        exports: [database_seeder_1.DatabaseSeeder],
    })
], SeederModule);
//# sourceMappingURL=seeder.module.js.map