import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListSensorsUseCase } from '../application/use-cases/list-sensors.use-case.js';
import { SessionAuthGuard } from '../../auth/presentation/session-auth.guard.js';
import { GetSensorUseCase } from '../application/use-cases/get-sensor.use-case.js';
import { CreateSensorUseCase } from '../application/use-cases/create-sensor.use-case.js';
import { CreateSensorDto } from './create-sensor.dto.js';
import { UpdateSensorUseCase } from '../application/use-cases/update-sensor.use-case.js';
import { UpdateSensorDto } from './update-sensor.dto.js';
import { DeleteSensorUseCase } from '../application/use-cases/delete-sensor.use-case.js';
import { PaginationQueryDto } from '../../../shared/database/pagination.dto.js';

@Controller('sensors')
@UseGuards(SessionAuthGuard)
export class SensorsController {
  constructor(
    private readonly listSensorsUseCase: ListSensorsUseCase,
    private readonly getSensorUseCase: GetSensorUseCase,
    private readonly createSensorUseCase: CreateSensorUseCase,
    private readonly updateSensorUseCase: UpdateSensorUseCase,
    private readonly deleteSensorUseCase: DeleteSensorUseCase,
  ) { }

  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.listSensorsUseCase.execute(query.page, query.limit);
  }

  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe({version: '4'})) id: string) {
    return this.getSensorUseCase.execute(id);
  }

  @Post()
  create(@Body() input: CreateSensorDto) {
    return this.createSensorUseCase.execute(input);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() input: UpdateSensorDto,
  ) {
    return this.updateSensorUseCase.execute(id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.deleteSensorUseCase.execute(id);
  }


}
