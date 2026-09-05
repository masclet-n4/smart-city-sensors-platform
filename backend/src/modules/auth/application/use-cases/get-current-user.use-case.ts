import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../../common/errors/application.error.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../ports/user.repository.js';

export interface CurrentUserResult {
  id: string;
  email: string;
  createdAt: Date;
}

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
  ) {}

  async execute(userId: string): Promise<CurrentUserResult> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new ApplicationError('UNAUTHORIZED', 'Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
