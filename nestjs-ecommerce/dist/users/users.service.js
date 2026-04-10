"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("@nestjs/config");
let UsersService = class UsersService {
    constructor(userModel, jwtService, configService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
    }
    async register({ name, email, password }) {
        const existing = await this.userModel.findOne({ email });
        if (existing)
            throw new common_1.BadRequestException('Email already exists');
        const hashed = await bcrypt.hash(password, 10);
        const user = new this.userModel({ name, email, password: hashed });
        await user.save();
        return { id: user._id, name, email };
    }
    async login({ email, password }) {
        const user = await this.userModel.findOne({ email });
        if (!user || !user.password)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const token = this.jwtService.sign({ id: user._id, email: user.email });
        return { token, user: { id: user._id, name: user.name, email: user.email } };
    }
    async socialLogin({ token }) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            const email = payload.email;
            const name = payload.name;
            const googleId = payload.sub;
            let user = await this.userModel.findOne({ email });
            if (!user) {
                user = new this.userModel({ name, email, googleId });
                await user.save();
            }
            const jwt = this.jwtService.sign({ id: user._id, email: user.email });
            return { token: jwt, user: { id: user._id, name: user.name, email: user.email } };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid Google Token');
        }
    }
    async getProfile(userId) {
        const user = await this.userModel.findById(userId).select('-password');
        if (!user)
            throw new common_1.BadRequestException('User not found');
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map