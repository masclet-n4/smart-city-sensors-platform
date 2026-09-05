import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { LoginUseCase } from '../application/use-cases/login.use-case.js';
import { LoginDto } from './login.dto.js';
import { SessionAuthGuard, type AuthenticatedRequest } from './session-auth.guard.js';
import { GetCurrentUserUseCase } from '../application/use-cases/get-current-user.use-case.js';

const COOKIE_NAME = 'session';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase
  ) { }

  @Post('login')
  async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token } = await this.loginUseCase.execute(input);

    response.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE,
    });

    return {
      message: 'Login successful',
    };
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return this.getCurrentUserUseCase.execute(request.userId!)
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });
    return {
      message: 'Logout successful',
    };
  }
}
