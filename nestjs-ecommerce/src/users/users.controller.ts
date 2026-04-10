import { Controller, Post, Body, Get, Req, UsePipes, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { RegistrationSchema, LoginSchema, SocialLoginSchema } from './validators/user.validator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @UsePipes(new JoiValidationPipe(RegistrationSchema))
  async register(@Body() body: any) {
    // register
    return this.usersService.register(body);
  }

  @Post('login')
  @UsePipes(new JoiValidationPipe(LoginSchema))
  async login(@Body() body: any) {
    // login
    return this.usersService.login(body);
  }

  @Post('social-login')
  @UsePipes(new JoiValidationPipe(SocialLoginSchema))
  async socialLogin(@Body() body: any) {
    // google
    return this.usersService.socialLogin(body);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    // profile
    return this.usersService.getProfile(req.user.userId);
  }
}
