import type { Sensor } from '@/features/sensors/model/sensor'
import { apiClient } from '@/shared/api/api-client'

export function getSensor(id: string): Promise<Sensor> {
  return apiClient<Sensor>(`/sensors/${id}`)
}
