import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../../common/errors/application.error.js';
import {
  SENSOR_REPOSITORY,
  type SensorRepository,
} from '../../../sensors/application/ports/sensor.repository.js';
import type { IngestionRun } from '../../domain/ingestion-run.js';
import {
  INGESTION_REPOSITORY,
  type IngestionRepository,
} from '../ports/ingestion.repository.js';
import type { NewTemperatureReading } from '../../domain/temperature-reading.js';
import { parsePayload } from '../../infrastructure/payload.parser.js';
import {
  SENSOR_SOURCE,
  type SensorSource,
} from '../ports/sensor-source.js';



export interface IngestNowInput {
  sensorId: string;
  payload: unknown;
}

@Injectable()
export class IngestDataUseCase {
  constructor(
    @Inject(SENSOR_REPOSITORY)
    private readonly sensors: SensorRepository,
    @Inject(INGESTION_REPOSITORY)
    private readonly ingestions: IngestionRepository,
    @Inject(SENSOR_SOURCE)
    private readonly sensorSource: SensorSource,
  ) {}

  async execute(input: IngestNowInput): Promise<IngestionRun> {
    const sensor = await this.sensors.findById(input.sensorId);

    if (!sensor) {
      throw new ApplicationError('NOT_FOUND', 'Sensor not found');
    }

    if (sensor.status === 'paused') {
      throw new ApplicationError('BAD_REQUEST', 'Sensor is paused');
    }

    const run = await this.ingestions.createRun(sensor.id);


    try {

      const payload =
        sensor.type === 'HTTP_POLL'
          ? await this.sensorSource.fetch(sensor.url!)
          : input.payload;

      const parsedReadings = parsePayload(payload);

      if (
        parsedReadings.some(
          (reading) => reading.sensorCode !== sensor.sensorCode,
        )
      ) {
        throw new ApplicationError(
          'BAD_REQUEST',
          'Payload sensor code does not match the selected sensor',
        );
      }

    const readings: NewTemperatureReading[] = parsedReadings.map(
      ({ timestamp, valueC }) => ({
        timestamp,
        valueC,
      }),
    );

    return await this.ingestions.completeRun(
      run.id,
      sensor.id,
      readings,
    );

    } catch (error) {
      const applicationError =
        error instanceof ApplicationError
          ? error
          : new ApplicationError(
              'BAD_REQUEST',
              error instanceof Error
                ? error.message
                : 'Invalid ingestion payload',
            );

      await this.ingestions.failRun(
        run.id,
        applicationError.message,
      );

      throw applicationError;
    }

  }
}
