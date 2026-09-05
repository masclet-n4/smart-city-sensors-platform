import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  type TokenPayload,
  type TokenService,
} from '../application/ports/token-service.js';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwt: JwtService) {}

  sign(payload: TokenPayload): Promise<string> {
    return this.jwt.signAsync({
      sub: payload.userId,
    });
  }

  async verify(token: string): Promise<TokenPayload> {
    const payload = await this.jwt.verifyAsync<JwtPayload>(token);

    return {
      userId: payload.sub,
    };
  }
}
