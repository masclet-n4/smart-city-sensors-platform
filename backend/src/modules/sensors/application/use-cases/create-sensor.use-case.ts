import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../../common/errors/application.error.js';
import type {
  Sensor,
  SensorStatus,
  SensorType,
} from '../../domain/sensor.js';
import {
  SENSOR_REPOSITORY,
  type SensorRepository,
} from '../ports/sensor.repository.js';

export interface CreateSensorInput {
  name: string;
  sensorCode: string;
  type: SensorType;
  status?: SensorStatus;
  url?: string;
}

@Injectable()
export class CreateSensorUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY)
    private readonly sensors: SensorRepository,
  ) {}

  async execute(input: CreateSensorInput): Promise<Sensor> {
    if (input.type === 'HTTP_POLL' && !input.url) {
      throw new ApplicationError(
        'BAD_REQUEST',
        'URL is required for HTTP_POLL sensors',
      );
    }

    if (input.type === 'MANUAL_UPLOAD' && input.url) {
      throw new ApplicationError(
        'BAD_REQUEST',
        'URL is not allowed for MANUAL_UPLOAD sensors',
      );
    }

    const existingSensor = await this.sensors.findByCode(input.sensorCode);

    if (existingSensor) {
      throw new ApplicationError(
        'CONFLICT',
        'Sensor code already exists',
      );
    }

    return this.sensors.create({
      name: input.name,
      sensorCode: input.sensorCode,
      type: input.type,
      status: input.status ?? 'active',
      url: input.url ?? null,
    });
  }
}
