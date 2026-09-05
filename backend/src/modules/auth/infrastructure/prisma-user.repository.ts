import { Injectable } from '@nestjs/common';
import type { User } from '../domain/user.js';
import type { UserRepository } from '../application/ports/user.repository.js';
import { PrismaService } from '../../../shared/database/prisma.service.js';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({
      where: { email },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({
      where: { id },
    });
  }
}
