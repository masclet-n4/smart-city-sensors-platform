import { Module } from '@nestjs/common';
import { SENSOR_REPOSITORY } from './application/ports/sensor.repository.js';
import { PrismaSensorRepository } from './infrastructure/prisma-sensor.repository.js';
import { ListSensorsUseCase } from './application/use-cases/list-sensors.use-case.js';
import { SensorsController } from './presentation/sensors.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { GetSensorUseCase } from './application/use-cases/get-sensor.use-case.js';
import { CreateSensorUseCase } from './application/use-cases/create-sensor.use-case.js';
import { UpdateSensorUseCase } from './application/use-cases/update-sensor.use-case.js';
import { DeleteSensorUseCase } from './application/use-cases/delete-sensor.use-case.js';


@Module({
  imports: [AuthModule],
  exports: [SENSOR_REPOSITORY],
  providers: [
    ListSensorsUseCase,
    GetSensorUseCase,
    CreateSensorUseCase,
    UpdateSensorUseCase,
    DeleteSensorUseCase,
    {
      provide: SENSOR_REPOSITORY,
      useClass: PrismaSensorRepository,
    }
  ],
  controllers: [SensorsController],
})
export class SensorsModule {}
