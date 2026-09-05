import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LoginUseCase } from './application/use-cases/login.use-case.js';
import {
  PASSWORD_HASHER,
} from './application/ports/password-hasher.js';
import {
  TOKEN_SERVICE,
} from './application/ports/token-service.js';
import {
  USER_REPOSITORY,
} from './application/ports/user.repository.js';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher.js';
import { JwtTokenService } from './infrastructure/jwt-token.service.js';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository.js';
import { AuthController } from './presentation/auth.controller.js';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case.js';
import { SessionAuthGuard } from './presentation/session-auth.guard.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  providers: [
    LoginUseCase,
    GetCurrentUserUseCase,
    SessionAuthGuard,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },

  ],
  controllers: [AuthController],
  exports: [SessionAuthGuard, TOKEN_SERVICE],
})
export class AuthModule {}
