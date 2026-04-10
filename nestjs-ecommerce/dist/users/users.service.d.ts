import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class UsersService {
    private userModel;
    private jwtService;
    private configService;
    private googleClient;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService, configService: ConfigService);
    register({ name, email, password }: {
        name: any;
        email: any;
        password: any;
    }): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: any;
        email: any;
    }>;
    login({ email, password }: {
        email: any;
        password: any;
    }): Promise<{
        token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
        };
    }>;
    socialLogin({ token }: {
        token: any;
    }): Promise<{
        token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
        };
    }>;
    getProfile(userId: string): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
