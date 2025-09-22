import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getAppInfo(): {
        name: string;
        version: string;
        description: string;
        environment: string;
        timestamp: string;
        uptime: number;
    };
}
