import type { IngestionRun } from '@/features/sensors/model/ingestion-run'
import { apiClient } from '@/shared/api/api-client'

export function ingestSensor(
  sensorId: string,
  payload?: unknown,
): Promise<IngestionRun> {
  return apiClient<IngestionRun>(`/sensors/${sensorId}/ingest`, {
    method: 'POST',
    body: JSON.stringify(payload ?? {}),
  })
}
