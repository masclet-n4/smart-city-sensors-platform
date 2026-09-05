import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ListReadingsQueryDto {
  @Transform(({ value }) => (value === undefined ? 0 : Number(value)))
  @IsInt()
  @Min(0)
  offset!: number;

  @Transform(({ value }) => (value === undefined ? 20 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit!: number;
}
