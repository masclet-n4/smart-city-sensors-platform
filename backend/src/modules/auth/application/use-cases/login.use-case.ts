import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../../common/errors/application.error.js';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../ports/password-hasher.js';
import {
  TOKEN_SERVICE,
  type TokenService,
} from '../ports/token-service.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../ports/user.repository.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const user = await this.users.findByEmail(input.email);

    if (!user) {
      throw new ApplicationError('UNAUTHORIZED', 'Invalid credentials');
    }

    const passwordMatches = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new ApplicationError('UNAUTHORIZED', 'Invalid credentials');
    }

    const token = await this.tokenService.sign({
      userId: user.id,
    });

    return { token };
  }
}
