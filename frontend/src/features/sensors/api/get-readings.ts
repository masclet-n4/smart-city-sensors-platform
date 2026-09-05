import type { TemperatureReading } from '@/features/sensors/model/temperature-reading'
import type { PaginatedResult } from '@/shared/api/pagination'
import { apiClient } from '@/shared/api/api-client'

export function getReadings(
  sensorId: string,
  limit: number,
  offset: number,
): Promise<PaginatedResult<TemperatureReading>> {
  return apiClient<PaginatedResult<TemperatureReading>>(
    `/sensors/${sensorId}/readings?limit=${limit}&offset=${offset}`,
  )
}
