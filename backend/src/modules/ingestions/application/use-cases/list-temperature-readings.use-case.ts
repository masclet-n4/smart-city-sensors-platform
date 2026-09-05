import { Inject, Injectable } from '@nestjs/common';
import {
  INGESTION_REPOSITORY,
  type IngestionRepository,
} from '../ports/ingestion.repository.js';
import {
  SENSOR_REPOSITORY,
  type SensorRepository,
} from '../../../sensors/application/ports/sensor.repository.js';
import { ApplicationError } from '../../../../common/errors/application.error.js';
import type { PaginatedResult } from '../../../../shared/database/pagination.js';
import type { TemperatureReading } from '../../domain/temperature-reading.js';

@Injectable()
export class ListTemperatureReadingsUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY)
    private readonly sensors: SensorRepository,
    @Inject(INGESTION_REPOSITORY)
    private readonly ingestions: IngestionRepository,
  ) {}

  async execute(
    sensorId: string,
    limit: number,
    offset: number,
  ): Promise<PaginatedResult<TemperatureReading>> {
    const sensor = await this.sensors.findById(sensorId);

    if (!sensor) {
      throw new ApplicationError('NOT_FOUND', 'Not found');
    }

    return this.ingestions.findReadings(sensorId, offset, limit);
  }
}
