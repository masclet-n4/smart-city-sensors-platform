export interface ParsedTemperatureReading {
  sensorCode: string;
  timestamp: Date;
  valueC: number;
}

export function parsePayload(
  payload: unknown,
): ParsedTemperatureReading[] {
  if (Array.isArray(payload)) {
    return parseFormatA(payload);
  }

  if (typeof payload === 'object' && payload !== null) {
    return parseFormatB(payload);
  }

  throw new Error('Unsupported temperature payload format');
}


export function parseFormatA(payload: unknown): ParsedTemperatureReading[] {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('Format A payload must be a non-empty array');
  }

  return payload.map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Format A item ${index} must be an object`);
    }

    const { sensorCode, ts, valueC } = item as Record<string, unknown>;

    if (typeof sensorCode !== 'string' || sensorCode.trim() === '') {
      throw new Error(`Format A item ${index} has an invalid sensorCode`);
    }

    if (typeof ts !== 'string') {
      throw new Error(`Format A item ${index} has an invalid ts`);
    }

    const timestamp = new Date(ts);

    if (Number.isNaN(timestamp.getTime())) {
      throw new Error(`Format A item ${index} has an invalid ts`);
    }

    if (typeof valueC !== 'number' || !Number.isFinite(valueC)) {
      throw new Error(`Format A item ${index} has an invalid valueC`);
    }

    return {
      sensorCode: sensorCode.trim(),
      timestamp,
      valueC,
    };
  });
}

export function parseFormatB(payload: unknown): ParsedTemperatureReading[] {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Format B payload must be an object');
  }

  const { deviceId, data } = payload as Record<string, unknown>;

  if (typeof deviceId !== 'string' || deviceId.trim() === '') {
    throw new Error('Format B payload has an invalid deviceId');
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Format B data must be a non-empty array');
  }

  return data.map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Format B item ${index} must be an object`);
    }

    const { time, temp } = item as Record<string, unknown>;

    if (typeof time !== 'number' || !Number.isFinite(time)) {
      throw new Error(`Format B item ${index} has an invalid time`);
    }

    const timestamp = new Date(time * 1000);

    if (Number.isNaN(timestamp.getTime())) {
      throw new Error(`Format B item ${index} has an invalid time`);
    }

    if (typeof temp !== 'number' || !Number.isFinite(temp)) {
      throw new Error(`Format B item ${index} has an invalid temp`);
    }

    return {
      sensorCode: deviceId.trim(),
      timestamp,
      valueC: temp,
    };
  });
}
