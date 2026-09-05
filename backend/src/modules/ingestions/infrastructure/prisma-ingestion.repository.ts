import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import type { PaginatedResult } from '../../../shared/database/pagination.js';
import type { IngestionRun } from '../domain/ingestion-run.js';
import type {
  IngestionRepository,
} from '../application/ports/ingestion.repository.js';
import type { NewTemperatureReading, TemperatureReading } from '../domain/temperature-reading.js';
import { ApplicationError } from '../../../common/errors/application.error.js';

@Injectable()
export class PrismaIngestionRepository implements IngestionRepository{
  constructor(private readonly prisma: PrismaService) {}

  async createRun(sensorId: string): Promise<IngestionRun> {
    const run = await this.prisma.client.ingestionRun.create({
      data: {
      sensorId,
      status: 'running',
      recordsProcessed: 0,
      errorMessage: null,
      finishedAt: null,
      },
    });

    return run;
  }

  async completeRun(
    runId: string,
    sensorId: string,
    readings: NewTemperatureReading[],
  ): Promise<IngestionRun> {
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        const { count } = await tx.temperatureReading.createMany({
          data: readings.map((reading) => ({
            sensorId,
            timestamp: reading.timestamp,
            valueC: reading.valueC,
          })),
          skipDuplicates: true,
        });

        return tx.ingestionRun.update({
          where: { id: runId },
          data: {
            finishedAt: new Date(),
            status: 'success',
            recordsProcessed: count,
            errorMessage: null,
          },
        });
      });
    } catch {
      throw new ApplicationError(
        'INTERNAL_ERROR',
        'Could not persist ingestion',
      );
    }
  }


  failRun(
    runId: string,
    errorMessage: string,
  ): Promise<IngestionRun> {
    return this.prisma.client.ingestionRun.update({
      where: { id: runId },
      data: {
        finishedAt: new Date(),
        status: 'error',
        recordsProcessed: 0,
        errorMessage,
      },
    });
  }

  async findRuns(skip: number, take: number): Promise<PaginatedResult<IngestionRun>> {
    const [data, total] = await Promise.all([
      this.prisma.client.ingestionRun.findMany({
        orderBy: { startedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.client.ingestionRun.count(),
    ]);

    return { data, total };
  }

  async findReadings(
    sensorId: string,
    skip: number,
    take: number,
  ): Promise<PaginatedResult<TemperatureReading>> {
    const [data, total] = await Promise.all([
      this.prisma.client.temperatureReading.findMany({
        where: { sensorId },
        orderBy: { timestamp: 'desc' },
        skip,
        take,
      }),
      this.prisma.client.temperatureReading.count({
        where: { sensorId },
      }),
    ]);

    return { data, total };
  }
}
