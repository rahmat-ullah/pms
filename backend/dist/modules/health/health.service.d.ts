import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
export declare class HealthService {
    private readonly configService;
    private readonly mongoConnection;
    private readonly logger;
    constructor(configService: ConfigService, mongoConnection: Connection);
    getHealthStatus(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
        version: string;
        database: {
            status: string;
            responseTime: number;
            error?: undefined;
        } | {
            status: string;
            responseTime: number;
            error: any;
        };
        memory: {
            used: number;
            total: number;
            percentage: number;
            rss: number;
            external: number;
        };
    }>;
    getDetailedHealthStatus(): Promise<{
        system: {
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
            nodeVersion: string;
            pid: number;
            cpuUsage: NodeJS.CpuUsage;
        };
        database: {
            readyState: import("mongoose").ConnectionStates;
            host: string;
            port: number;
            name: string;
            status: string;
            responseTime: number;
            error?: undefined;
        } | {
            readyState: import("mongoose").ConnectionStates;
            host: string;
            port: number;
            name: string;
            status: string;
            responseTime: number;
            error: any;
        };
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
        version: string;
        memory: {
            used: number;
            total: number;
            percentage: number;
            rss: number;
            external: number;
        };
    }>;
    private checkDatabaseHealth;
    private getMemoryUsage;
}
