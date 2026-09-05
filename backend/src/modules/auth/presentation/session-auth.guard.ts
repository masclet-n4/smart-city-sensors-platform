import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  TOKEN_SERVICE,
  type TokenService,
} from '../application/ports/token-service.js';

const COOKIE_NAME = 'session';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const token: unknown = request.cookies?.[COOKIE_NAME];

    if (typeof token !== 'string' || token.length === 0) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const { userId } = await this.tokenService.verify(token);

      request.userId = userId;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
