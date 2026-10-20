import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const JWT_SECRET =
  process.env.JWT_SECRET || 'lumishop_jwt_secret_key_2026';
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'lumishop_refresh_secret_key_2026';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          let token = null;
          if (req?.query?.token && typeof req.query.token === 'string') {
            token = req.query.token;
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
