import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {
    this.googleClient = new OAuth2Client(this.configService.get<string>('GOOGLE_CLIENT_ID'));
  }

  async register({ name, email, password }) {
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new BadRequestException('Email already exists');
    
    // encrypt
    const hashed = await bcrypt.hash(password, 10);
    const user = new this.userModel({ name, email, password: hashed });
    await user.save();
    
    return { id: user._id, name, email };
  }

  async login({ email, password }) {
    const user = await this.userModel.findOne({ email });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');
    
    // verify
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // token
    const token = this.jwtService.sign({ id: user._id, email: user.email });
    return { token, user: { id: user._id, name: user.name, email: user.email } };
  }

  async socialLogin({ token }) {
    try {
      // google verify
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      
      const email = payload.email;
      const name = payload.name;
      const googleId = payload.sub;

      let user = await this.userModel.findOne({ email });
      if (!user) {
        // new user
        user = new this.userModel({ name, email, googleId });
        await user.save();
      }
      
      // jwt
      const jwt = this.jwtService.sign({ id: user._id, email: user.email });
      return { token: jwt, user: { id: user._id, name: user.name, email: user.email } };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google Token');
    }
  }

  async getProfile(userId: string) {
    // profile
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new BadRequestException('User not found');
    return user;
  }
}
