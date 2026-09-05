import type { Sensor } from '@/features/sensors/model/sensor'
import type { PaginatedResult } from '@/shared/api/pagination'
import { apiClient } from '@/shared/api/api-client'

export function getSensors(
  page: number,
  limit: number,
): Promise<PaginatedResult<Sensor>> {
  return apiClient<PaginatedResult<Sensor>>(
    `/sensors?page=${page}&limit=${limit}`,
  )
}
