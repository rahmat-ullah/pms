import { UserSeeder } from './user.seeder';
import { EmployeeSeeder } from './employee.seeder';
export declare class DatabaseSeeder {
    private readonly userSeeder;
    private readonly employeeSeeder;
    private readonly logger;
    constructor(userSeeder: UserSeeder, employeeSeeder: EmployeeSeeder);
    seedAll(): Promise<void>;
    clearAll(): Promise<void>;
    reseedAll(): Promise<void>;
    seedUsers(): Promise<void>;
    seedEmployees(): Promise<void>;
    clearUsers(): Promise<void>;
    clearEmployees(): Promise<void>;
    reseedUsers(): Promise<void>;
    reseedEmployees(): Promise<void>;
    getSeederStatus(): Promise<any>;
}
