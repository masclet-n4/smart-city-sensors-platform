import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/database/prisma.module.js';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { SensorsModule } from './modules/sensors/sensors.module.js';
import { IngestionsModule } from './modules/ingestions/ingestions.module.js';
import { MockModule } from './modules/mock/mock.module.js';


@Module({
  imports: [PrismaModule, AuthModule, SensorsModule, IngestionsModule, MockModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    }
  ],
})
export class AppModule {}
