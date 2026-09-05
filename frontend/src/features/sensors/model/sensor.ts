export type SensorType = 'HTTP_POLL' | 'MANUAL_UPLOAD'
export type SensorStatus = 'active' | 'paused'

export interface Sensor {
  id: string
  name: string
  sensorCode: string
  type: SensorType
  status: SensorStatus
  url: string | null
  createdAt: string
  updatedAt: string
}
