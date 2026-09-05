import type { IngestionRun } from '@/features/sensors/model/ingestion-run'
import type { PaginatedResult } from '@/shared/api/pagination'
import { apiClient } from '@/shared/api/api-client'

export function getIngestions(
  page: number,
  limit: number,
): Promise<PaginatedResult<IngestionRun>> {
  return apiClient<PaginatedResult<IngestionRun>>(
    `/ingestions?page=${page}&limit=${limit}`,
  )
}
