import { ConfigService } from '@nestjs/config';
export declare class AppService {
    private readonly configService;
    constructor(configService: ConfigService);
    getAppInfo(): {
        name: string;
        version: string;
        description: string;
        environment: string;
        timestamp: string;
        uptime: number;
    };
}
