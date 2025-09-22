import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '../../../shared/database/schemas/user.schema';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userModel;
    constructor(configService: ConfigService, userModel: Model<UserDocument>);
    validate(payload: JwtPayload): Promise<UserDocument>;
}
export {};
