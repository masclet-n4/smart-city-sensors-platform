import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/shared/database/prisma.service.js';
import { PrismaIngestionRepository } from '../src/modules/ingestions/infrastructure/prisma-ingestion.repository.js';

describe('Ingestion transaction (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let repository: PrismaIngestionRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    repository = new PrismaIngestionRepository(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('rolls back readings when completing the run fails', async () => {
    const sensor = await prisma.client.sensor.findUniqueOrThrow({
      where: { sensorCode: 'TEMP-MANUAL-001' },
    });
    const timestamp = new Date('2099-01-01T00:00:00.000Z');

    await prisma.client.temperatureReading.deleteMany({
      where: {
        sensorId: sensor.id,
        timestamp,
      },
    });

    await expect(
      repository.completeRun(randomUUID(), sensor.id, [
        {
          timestamp,
          valueC: 21.4,
        },
      ]),
    ).rejects.toThrow();

    const persisted = await prisma.client.temperatureReading.count({
      where: {
        sensorId: sensor.id,
        timestamp,
      },
    });

    expect(persisted).toBe(0);
  });
});
