export const SENSOR_TYPES = ['HTTP_POLL', 'MANUAL_UPLOAD'] as const;
export type SensorType = (typeof SENSOR_TYPES)[number];

export const SENSOR_STATUSES = ['active', 'paused'] as const;
export type SensorStatus = (typeof SENSOR_STATUSES)[number];

export interface Sensor {
  id: string;
  name: string;
  sensorCode: string;
  type: SensorType;
  status: SensorStatus;
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
}
