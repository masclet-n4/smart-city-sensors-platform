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
  type UpdateSensorData,
} from '../ports/sensor.repository.js';

export interface UpdateSensorInput {
  name?: string;
  sensorCode?: string;
  type?: SensorType;
  status?: SensorStatus;
  url?: string;
}

@Injectable()
export class UpdateSensorUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY)
    private readonly sensors: SensorRepository,
  ) {}

  async execute(
    id: string,
    input: UpdateSensorInput,
  ): Promise<Sensor> {
    const currentSensor = await this.sensors.findById(id);

    if (!currentSensor) {
      throw new ApplicationError('NOT_FOUND', 'Sensor not found');
    }

    if (
      input.sensorCode &&
      input.sensorCode !== currentSensor.sensorCode
    ) {
      const sensorWithCode = await this.sensors.findByCode(
        input.sensorCode,
      );

      if (sensorWithCode) {
        throw new ApplicationError(
          'CONFLICT',
          'Sensor code already exists',
        );
      }
    }

    const type = input.type ?? currentSensor.type;
    const url =
      type === 'MANUAL_UPLOAD'
        ? null
        : input.url ?? currentSensor.url;

    if (type === 'HTTP_POLL' && !url) {
      throw new ApplicationError(
        'BAD_REQUEST',
        'URL is required for HTTP_POLL sensors',
      );
    }

    const changes: UpdateSensorData = {
      ...input,
      type,
      url,
    };

    const updatedSensor = await this.sensors.update(id, changes);

    if (!updatedSensor) {
      throw new ApplicationError('NOT_FOUND', 'Sensor not found');
    }

    return updatedSensor;
  }
}
