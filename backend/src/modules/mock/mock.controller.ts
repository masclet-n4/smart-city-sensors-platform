import { Controller, Get } from '@nestjs/common';

const SENSOR_CODE = 'TEMP-HTTP-001';

@Controller('mock')
export class MockController {
  @Get('temp-format-a')
  formatA() {
    const now = Date.now();

    return [0, 1, 2].map((minutesAgo) => ({
      sensorCode: SENSOR_CODE,
      ts: new Date(now - minutesAgo * 60_000).toISOString(),
      valueC: 21.4 + minutesAgo,
    }));
  }

  @Get('temp-format-b')
  formatB() {
    const now = Math.floor(Date.now() / 1000);

    return {
      deviceId: SENSOR_CODE,
      data: [0, 1, 2].map((minutesAgo) => ({
        time: now - minutesAgo * 60,
        temp: 21.4 + minutesAgo,
      })),
    };
  }
}
