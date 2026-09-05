import { describe, expect, it, vi } from 'vitest';
import { ApplicationError } from '../../../../common/errors/application.error.js';
import type { SensorRepository } from '../../../sensors/application/ports/sensor.repository.js';
import type { IngestionRepository } from '../ports/ingestion.repository.js';
import type { SensorSource } from '../ports/sensor-source.js';
import type { Sensor } from '../../../sensors/domain/sensor.js';


import { IngestDataUseCase } from './ingest-data.use-case.js';


const sensor: Sensor = {
  id: 'sensor-1',
  name: 'Manual sensor',
  sensorCode: 'TEMP-001',
  type: 'MANUAL_UPLOAD' as const,
  status: 'active' as const,
  url: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const run = {
  id: 'run-1',
  sensorId: sensor.id,
  startedAt: new Date(),
  finishedAt: null,
  status: 'running' as const,
  recordsProcessed: 0,
  errorMessage: null,
};

function createUseCase(currentSensor = sensor) {
  const sensors = {
    findById: vi.fn().mockResolvedValue(currentSensor),
  } as unknown as SensorRepository;

  const ingestions = {
    createRun: vi.fn().mockResolvedValue(run),
    completeRun: vi.fn().mockResolvedValue({
      ...run,
      finishedAt: new Date(),
      status: 'success',
      recordsProcessed: 1,
    }),
    failRun: vi.fn().mockResolvedValue({
      ...run,
      finishedAt: new Date(),
      status: 'error',
    }),

  } as unknown as IngestionRepository;

  const sensorSource = {
    fetch: vi.fn(),
  } as SensorSource;

  return {
    useCase: new IngestDataUseCase(sensors, ingestions, sensorSource),
    ingestions,
    sensorSource,
  };
}

describe('IngestDataUseCase', () => {
  it('ingests a valid manual payload', async () => {
    const { useCase, ingestions } = createUseCase();

    const result = await useCase.execute({
      sensorId: sensor.id,
      payload: [
        {
          sensorCode: sensor.sensorCode,
          ts: '2026-01-30T10:00:00Z',
          valueC: 21.4,
        },
      ],
    });

    expect(ingestions.completeRun).toHaveBeenCalledWith(
      run.id,
      sensor.id,
      [
        {
          timestamp: new Date('2026-01-30T10:00:00Z'),
          valueC: 21.4,
        },
      ],
    );

    expect(result.status).toBe('success');
    expect(result.recordsProcessed).toBe(1);
  });

  it('records a mismatched sensor code as an error', async () => {
    const { useCase, ingestions } = createUseCase();

    await expect(
      useCase.execute({
        sensorId: sensor.id,
        payload: [
          {
            sensorCode: 'OTHER-SENSOR',
            ts: '2026-01-30T10:00:00Z',
            valueC: 21.4,
          },
        ],
      }),
    ).rejects.toEqual(
      new ApplicationError(
        'BAD_REQUEST',
        'Payload sensor code does not match the selected sensor',
      ),
    );

    expect(ingestions.completeRun).not.toHaveBeenCalled();
    expect(ingestions.failRun).toHaveBeenCalledWith(
      run.id,
      'Payload sensor code does not match the selected sensor',
    );

  });

  it('rejects ingestion when the sensor is paused', async () => {
    const pausedSensor: Sensor = {
      ...sensor,
      status: 'paused',
    };

    const { useCase, ingestions, sensorSource } =
      createUseCase(pausedSensor);

    await expect(
      useCase.execute({
        sensorId: pausedSensor.id,
        payload: [],
      }),
    ).rejects.toEqual(
      new ApplicationError('BAD_REQUEST', 'Sensor is paused'),
    );

    expect(ingestions.createRun).not.toHaveBeenCalled();
    expect(ingestions.completeRun).not.toHaveBeenCalled();
    expect(ingestions.failRun).not.toHaveBeenCalled();
    expect(sensorSource.fetch).not.toHaveBeenCalled();
  });

  it('fetches the payload for an HTTP sensor', async () => {
    const httpSensor = {
      ...sensor,
      type: 'HTTP_POLL' as const,
      url: 'http://mock.local/temperature',
    };
    const { useCase, sensorSource } = createUseCase(httpSensor);

    vi.mocked(sensorSource.fetch).mockResolvedValue([
      {
        sensorCode: httpSensor.sensorCode,
        ts: '2026-01-30T10:00:00Z',
        valueC: 23,
      },
    ]);

    const result = await useCase.execute({
      sensorId: httpSensor.id,
      payload: 'this body must be ignored',
    });

    expect(sensorSource.fetch).toHaveBeenCalledWith(httpSensor.url);
    expect(result.status).toBe('success');
    expect(result.recordsProcessed).toBe(1);
  });

  it('classifies an invalid payload as bad request', async () => {
    const { useCase, ingestions } = createUseCase();

    await expect(
      useCase.execute({
        sensorId: sensor.id,
        payload: [],
      }),
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });

    expect(ingestions.failRun).toHaveBeenCalledWith(
      run.id,
      expect.any(String),
    );
  });

  it('preserves an upstream timeout', async () => {
    const httpSensor = {
      ...sensor,
      type: 'HTTP_POLL' as const,
      url: 'http://mock.local/temperature',
    };
    const { useCase, ingestions, sensorSource } =
      createUseCase(httpSensor);

    vi.mocked(sensorSource.fetch).mockRejectedValue(
      new ApplicationError(
        'UPSTREAM_TIMEOUT',
        'Sensor source timed out',
      ),
    );

    await expect(
      useCase.execute({
        sensorId: httpSensor.id,
        payload: undefined,
      }),
    ).rejects.toEqual(
      new ApplicationError(
        'UPSTREAM_TIMEOUT',
        'Sensor source timed out',
      ),
    );

    expect(ingestions.failRun).toHaveBeenCalledWith(
      run.id,
      'Sensor source timed out',
    );
  });

  it('preserves a sanitized persistence error', async () => {
    const { useCase, ingestions } = createUseCase();

    vi.mocked(ingestions.completeRun).mockRejectedValue(
      new ApplicationError(
        'INTERNAL_ERROR',
        'Could not persist ingestion',
      ),
    );

    await expect(
      useCase.execute({
        sensorId: sensor.id,
        payload: [
          {
            sensorCode: sensor.sensorCode,
            ts: '2026-01-30T10:00:00Z',
            valueC: 21.4,
          },
        ],
      }),
    ).rejects.toEqual(
      new ApplicationError(
        'INTERNAL_ERROR',
        'Could not persist ingestion',
      ),
    );

    expect(ingestions.failRun).toHaveBeenCalledWith(
      run.id,
      'Could not persist ingestion',
    );
  });
});
