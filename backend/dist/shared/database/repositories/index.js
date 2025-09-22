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
exports.DatabaseRepositories = void 0;
__exportStar(require("./base.repository"), exports);
__exportStar(require("./user.repository"), exports);
__exportStar(require("./employee.repository"), exports);
__exportStar(require("./project.repository"), exports);
const user_repository_1 = require("./user.repository");
const employee_repository_1 = require("./employee.repository");
const project_repository_1 = require("./project.repository");
exports.DatabaseRepositories = [
    user_repository_1.UserRepository,
    employee_repository_1.EmployeeRepository,
    project_repository_1.ProjectRepository,
];
//# sourceMappingURL=index.js.map