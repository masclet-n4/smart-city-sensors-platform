import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  SENSOR_STATUSES,
  SENSOR_TYPES,
  type SensorStatus,
  type SensorType,
} from '../domain/sensor.js';

export class CreateSensorDto {
  @IsString()
  @MinLength(3)
  @Matches(/\S/, {
    message: 'El nombre no puede estar vacío ni contener solo espacios',
  })
  @MaxLength(120, {
    message: 'El nombre no puede superar los 120 caracteres',
  })
  name!: string;

  @IsString()
  @MinLength(3)
  @Matches(/\S/, {
    message: 'El código del sensor no puede estar vacío ni contener solo espacios',
  })
  @MaxLength(80, {
    message: 'El código del sensor no puede superar los 80 caracteres',
  })

  sensorCode!: string;

  @IsIn(SENSOR_TYPES)
  type!: SensorType;

  @IsOptional()
  @IsIn(SENSOR_STATUSES)
  status: SensorStatus = 'active';

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  url?: string;
}
