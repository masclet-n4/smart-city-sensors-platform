import type { PaginatedResult } from '../../../../shared/database/pagination.js';
import type {
  Sensor,
  SensorStatus,
  SensorType,
} from '../../domain/sensor.js';

export const SENSOR_REPOSITORY = Symbol('SENSOR_REPOSITORY');

export interface CreateSensorData {
  name: string;
  sensorCode: string;
  type: SensorType;
  status: SensorStatus;
  url: string | null;
}

export interface UpdateSensorData {
  name?: string;
  sensorCode?: string;
  type?: SensorType;
  status?: SensorStatus;
  url?: string | null;
}

export interface SensorRepository {
  findAll(skip: number, take: number): Promise<PaginatedResult<Sensor>>;
  findById(id: string): Promise<Sensor | null>;
  findByCode(sensorCode: string): Promise<Sensor | null>;
  create(data: CreateSensorData): Promise<Sensor>;
  update(id: string, data: UpdateSensorData): Promise<Sensor | null>;
  delete(id: string): Promise<boolean>;
}
