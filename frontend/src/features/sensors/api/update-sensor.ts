import type { Sensor } from '@/features/sensors/model/sensor'
import type { SensorFormValues } from '@/features/sensors/components/SensorForm'
import { apiClient } from '@/shared/api/api-client'

export function updateSensor(
  id: string,
  input: Partial<SensorFormValues>,
): Promise<Sensor> {
  return apiClient<Sensor>(`/sensors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}
