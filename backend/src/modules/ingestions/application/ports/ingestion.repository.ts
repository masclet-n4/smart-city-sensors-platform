import type { PaginatedResult } from '../../../../shared/database/pagination.js';
import type { IngestionRun } from '../../domain/ingestion-run.js';
import type {
  NewTemperatureReading,
  TemperatureReading,
} from '../../domain/temperature-reading.js';

export const INGESTION_REPOSITORY = Symbol('INGESTION_REPOSITORY');

export interface IngestionRepository {
  createRun(sensorId: string): Promise<IngestionRun>;

  completeRun(
    runId: string,
    sensorId: string,
    readings: NewTemperatureReading[],
  ): Promise<IngestionRun>;

  failRun(
    runId: string,
    errorMessage: string,
  ): Promise<IngestionRun>;

  findRuns(skip: number, take: number): Promise<PaginatedResult<IngestionRun>>;

  findReadings(
    sensorId: string,
    skip: number,
    take: number,
  ): Promise<PaginatedResult<TemperatureReading>>;
}
