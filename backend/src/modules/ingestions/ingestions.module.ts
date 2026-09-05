import { Module } from '@nestjs/common';
import { INGESTION_REPOSITORY } from './application/ports/ingestion.repository.js';
import { PrismaIngestionRepository } from './infrastructure/prisma-ingestion.repository.js';
import { IngestDataUseCase } from './application/use-cases/ingest-data.use-case.js';
import { SensorsModule } from '../sensors/sensors.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { IngestionRunsController, IngestionsController } from './presentation/ingestions.controller.js';
import { SENSOR_SOURCE } from './application/ports/sensor-source.js';
import { HttpSensorSource } from './infrastructure/http-sensor-source.js';
import { ListIngestionRunsUseCase } from './application/use-cases/list-ingestion.use-case.js';
import { ListTemperatureReadingsUseCase } from './application/use-cases/list-temperature-readings.use-case.js';




@Module({
  providers: [
    IngestDataUseCase,
    ListIngestionRunsUseCase,
    ListTemperatureReadingsUseCase,
    {
      provide: INGESTION_REPOSITORY,
      useClass: PrismaIngestionRepository,
    },
    {
      provide: SENSOR_SOURCE,
      useClass: HttpSensorSource,
    }
  ],
  exports: [INGESTION_REPOSITORY],
  imports: [SensorsModule, AuthModule],
  controllers: [IngestionsController, IngestionRunsController],
})
export class IngestionsModule {}
