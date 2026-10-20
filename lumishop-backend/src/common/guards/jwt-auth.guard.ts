import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    _status?: any,
  ) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu endpoint được đánh dấu @Public():
    // Cho phép truy cập bình thường kể cả khi không có token (khách vãng lai).
    // Nếu có token hợp lệ, user sẽ được gán vào req.user.
    if (isPublic) {
      return user || null;
    }

    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException('Bạn chưa đăng nhập hoặc token không hợp lệ')
      );
    }

    return user;
  }
}
