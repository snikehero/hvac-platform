import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsDateString,
  IsOptional,
  IsIn,
} from 'class-validator';

export class HvacPointDto {
  value: number | string | boolean;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsIn(['GOOD', 'BAD', 'UNCERTAIN'])
  quality?: 'GOOD' | 'BAD' | 'UNCERTAIN';
}

export class TelemetryDto {
  @IsString()
  @IsNotEmpty()
  plantId: string;

  @IsString()
  @IsNotEmpty()
  stationId: string;

  @IsDateString()
  timestamp: string;

  @IsObject()
  points: Record<string, HvacPointDto>;
}
