import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): Promise<{
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
    getDetailedHealth(): Promise<{
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
}
