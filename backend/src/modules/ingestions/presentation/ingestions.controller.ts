import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../../auth/presentation/session-auth.guard.js';
import { IngestDataUseCase } from '../application/use-cases/ingest-data.use-case.js';
import { ListIngestionRunsUseCase } from '../application/use-cases/list-ingestion.use-case.js';
import { ListReadingsQueryDto } from './list-readings-query.dto.js';
import { ListTemperatureReadingsUseCase } from '../application/use-cases/list-temperature-readings.use-case.js';
import { PaginationQueryDto } from '../../../shared/database/pagination.dto.js';


@Controller('sensors')
@UseGuards(SessionAuthGuard)
export class IngestionsController {
  constructor(
    private readonly ingestDataUseCase: IngestDataUseCase,
    private readonly listTemperatureReadingsUseCase: ListTemperatureReadingsUseCase,
  ) {}

  @Post(':id/ingest')
  ingest(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() payload: unknown,
  ) {
    return this.ingestDataUseCase.execute({
      sensorId: id,
      payload,
    });
  }

  @Get(':id/readings')
  listReadings(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() query: ListReadingsQueryDto,
  ) {
    return this.listTemperatureReadingsUseCase.execute(
      id,
      query.limit,
      query.offset,
    );
  }
}

@Controller('ingestions')
@UseGuards(SessionAuthGuard)
export class IngestionRunsController {
  constructor(
    private readonly listIngestionRunsUseCase: ListIngestionRunsUseCase,
  ) {}

  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.listIngestionRunsUseCase.execute(query.page, query.limit);
  }
}
