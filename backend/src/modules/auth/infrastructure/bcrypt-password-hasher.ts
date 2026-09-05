import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import type { PasswordHasher } from '../application/ports/password-hasher.js';

const SALT_ROUNDS = 12;

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  verify(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
