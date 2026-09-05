import { Inject, Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../../shared/database/pagination.js';
import type { Sensor } from '../../domain/sensor.js';
import { SENSOR_REPOSITORY, type SensorRepository } from '../ports/sensor.repository.js';

@Injectable()
export class ListSensorsUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY)
    private readonly sensors: SensorRepository,
  ) {}

  async execute(page: number, limit: number): Promise<PaginatedResult<Sensor>> {
    const skip = (page - 1) * limit;
    return this.sensors.findAll(skip, limit);
  }
}
