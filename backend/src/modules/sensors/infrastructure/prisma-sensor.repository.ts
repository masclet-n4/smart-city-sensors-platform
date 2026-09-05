import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client.js';
import { ApplicationError } from '../../../common/errors/application.error.js';
import { PrismaService } from '../../../shared/database/prisma.service.js';
import type { PaginatedResult } from '../../../shared/database/pagination.js';
import type { Sensor } from '../domain/sensor.js';
import type {
  CreateSensorData,
  SensorRepository,
  UpdateSensorData,
} from '../application/ports/sensor.repository.js';

function throwIfSensorCodeConflict(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new ApplicationError(
      'CONFLICT',
      'Sensor code already exists',
    );
  }

  throw error;
}


@Injectable()
export class PrismaSensorRepository implements SensorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip: number, take: number): Promise<PaginatedResult<Sensor>> {
    const [data, total] = await Promise.all([
      this.prisma.client.sensor.findMany({ skip, take }),
      this.prisma.client.sensor.count(),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Sensor | null> {
    const sensor = await this.prisma.client.sensor.findUnique({
      where: { id },
    });

    return sensor;
  }

  async findByCode(sensorCode: string): Promise<Sensor | null> {
    const sensor = await this.prisma.client.sensor.findUnique({
      where: { sensorCode },
    });

    return sensor;
  }

  async create(data: CreateSensorData): Promise<Sensor> {
    try {
      return await this.prisma.client.sensor.create({
        data,
      });
    } catch (error) {
      throwIfSensorCodeConflict(error);
    }
  }


  async update(
    id: string,
    data: UpdateSensorData,
  ): Promise<Sensor | null> {
    try {
      return await this.prisma.client.sensor.update({
        where: { id },
        data,
      });
    } catch (error) {
      throwIfSensorCodeConflict(error);
    }
  }


  async delete(id: string): Promise<boolean> {
    const existingSensor = await this.findById(id);

    if (!existingSensor) {
      return false;
    }

    await this.prisma.client.sensor.delete({
      where: { id },
    });

    return true;
  }
}
