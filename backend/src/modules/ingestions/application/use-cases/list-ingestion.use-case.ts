import { Inject, Injectable } from '@nestjs/common';
import {
  INGESTION_REPOSITORY,
  type IngestionRepository,
} from '../ports/ingestion.repository.js';
import type { PaginatedResult } from '../../../../shared/database/pagination.js';
import type { IngestionRun } from '../../domain/ingestion-run.js';

@Injectable()
export class ListIngestionRunsUseCase {
  constructor(
    @Inject(INGESTION_REPOSITORY)
    private readonly ingestions: IngestionRepository,
  ) {}

  execute(page: number, limit: number): Promise<PaginatedResult<IngestionRun>> {
    const skip = (page - 1) * limit;
    return this.ingestions.findRuns(skip, limit);
  }
}
