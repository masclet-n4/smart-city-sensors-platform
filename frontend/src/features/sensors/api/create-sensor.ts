import type {
  Sensor,
  SensorStatus,
  SensorType,
} from '@/features/sensors/model/sensor'
import { apiClient } from '@/shared/api/api-client'

export interface CreateSensorInput {
  name: string
  sensorCode: string
  type: SensorType
  status: SensorStatus
  url?: string
}

export function createSensor(input: CreateSensorInput): Promise<Sensor> {
  return apiClient<Sensor>('/sensors', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
