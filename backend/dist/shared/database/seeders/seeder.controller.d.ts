import { DatabaseSeeder } from './database.seeder';
export declare class SeederController {
    private readonly databaseSeeder;
    constructor(databaseSeeder: DatabaseSeeder);
    getStatus(): Promise<{
        success: boolean;
        data: any;
    }>;
    seedAll(): Promise<{
        success: boolean;
        message: string;
    }>;
    clearAll(): Promise<{
        success: boolean;
        message: string;
    }>;
    reseedAll(): Promise<{
        success: boolean;
        message: string;
    }>;
    seedUsers(): Promise<{
        success: boolean;
        message: string;
    }>;
    seedEmployees(): Promise<{
        success: boolean;
        message: string;
    }>;
    clearUsers(): Promise<{
        success: boolean;
        message: string;
    }>;
    clearEmployees(): Promise<{
        success: boolean;
        message: string;
    }>;
    reseedUsers(): Promise<{
        success: boolean;
        message: string;
    }>;
    reseedEmployees(): Promise<{
        success: boolean;
        message: string;
    }>;
}
