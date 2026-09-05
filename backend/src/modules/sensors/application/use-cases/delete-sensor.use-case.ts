import { Inject, Injectable } from '@nestjs/common';
import { SENSOR_REPOSITORY, type SensorRepository } from '../ports/sensor.repository.js';
import { ApplicationError } from '../../../../common/errors/application.error.js';

@Injectable()
export class DeleteSensorUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY)
    private readonly sensors: SensorRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.sensors.delete(id);
    if (!deleted) {
      throw new ApplicationError('NOT_FOUND', 'Not found');
    }
  }
}
