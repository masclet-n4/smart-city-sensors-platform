export const SENSOR_SOURCE = Symbol('SENSOR_SOURCE');

export interface SensorSource {
  fetch(url: string): Promise<unknown>;
}
