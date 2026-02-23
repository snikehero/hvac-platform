import { IsString, IsNotEmpty, IsIn, IsDateString, IsOptional } from 'class-validator';

export class CommandRequestDto {
  @IsString()
  @IsNotEmpty()
  plantId: string;

  @IsString()
  @IsNotEmpty()
  stationId: string;

  @IsIn(['fan_status', 'damper_position'])
  command: 'fan_status' | 'damper_position';

  @IsNotEmpty()
  value: string | number;
}

export class CommandResultDto {
  @IsString()
  @IsNotEmpty()
  commandId: string;

  @IsIn(['SUCCESS', 'ERROR', 'TIMEOUT'])
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';

  @IsOptional()
  @IsString()
  message?: string;

  @IsDateString()
  timestamp: string;
}
