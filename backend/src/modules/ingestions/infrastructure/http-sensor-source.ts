import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error.js';
import type { SensorSource } from '../application/ports/sensor-source.js';

@Injectable()
export class HttpSensorSource implements SensorSource {
  async fetch(url: string): Promise<unknown> {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5_000),
      });

      if (!response.ok) {
        throw new ApplicationError(
          'UPSTREAM_ERROR',
          'Sensor source is unavailable',
        );
      }

      return response.json() as Promise<unknown>;
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }

      if (
        error instanceof Error &&
        (error.name === 'TimeoutError' || error.name === 'AbortError')
      ) {
        throw new ApplicationError(
          'UPSTREAM_TIMEOUT',
          'Sensor source timed out',
        );
      }

      throw new ApplicationError(
        'UPSTREAM_ERROR',
        'Could not reach sensor source',
      );
    }
  }
}
