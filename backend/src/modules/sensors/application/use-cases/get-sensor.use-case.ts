import { Inject, Injectable } from '@nestjs/common';
import { type Sensor } from '../../domain/sensor.js';
import { SENSOR_REPOSITORY, type SensorRepository } from '../ports/sensor.repository.js';
import { ApplicationError } from '../../../../common/errors/application.error.js';

@Injectable()
export class GetSensorUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY)
    private readonly sensors: SensorRepository,
  ) {}

  async execute(id: string): Promise<Sensor> {
    const sensor = await this.sensors.findById(id);
    if (!sensor) {
      throw new ApplicationError('NOT_FOUND', 'Not found');
    }
    return sensor;
  }
}
