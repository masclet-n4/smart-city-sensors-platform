export interface TemperatureReading {
  id: string;
  sensorId: string;
  timestamp: Date;
  valueC: number;
}

export interface NewTemperatureReading {
  timestamp: Date;
  valueC: number;
}
