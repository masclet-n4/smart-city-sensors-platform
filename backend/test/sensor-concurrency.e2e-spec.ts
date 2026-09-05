import 'dotenv/config';
import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/shared/database/prisma.service.js';
import { PrismaSensorRepository } from '../src/modules/sensors/infrastructure/prisma-sensor.repository.js';

describe('Sensor concurrency (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let repository: PrismaSensorRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    repository = new PrismaSensorRepository(prisma);
  });

  afterAll(async () => {
    await prisma.client.sensor.deleteMany({
      where: { sensorCode: 'TEMP-CONCURRENT-001' },
    });

    await app.close();
  });

  it('translates a concurrent duplicate into conflict', async () => {
    const sensorCode = 'TEMP-CONCURRENT-001';

    await prisma.client.sensor.deleteMany({
      where: { sensorCode },
    });

    const results = await Promise.allSettled([
      repository.create({
        name: 'Concurrent sensor A',
        sensorCode,
        type: 'MANUAL_UPLOAD',
        status: 'active',
        url: null,
      }),
      repository.create({
        name: 'Concurrent sensor B',
        sensorCode,
        type: 'MANUAL_UPLOAD',
        status: 'active',
        url: null,
      }),
    ]);

    const fulfilled = results.filter(
      (result) => result.status === 'fulfilled',
    );
    const rejected = results.filter(
      (result) => result.status === 'rejected',
    );

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]).toMatchObject({
      reason: {
        code: 'CONFLICT',
        message: 'Sensor code already exists',
      },
    });

    await expect(
      prisma.client.sensor.count({
        where: { sensorCode },
      }),
    ).resolves.toBe(1);
  });
});
