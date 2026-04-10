import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // check
    if (err || !user) {
      throw err || new UnauthorizedException('Please log in or provide a valid Bearer token.');
    }
    return user;
  }
}
