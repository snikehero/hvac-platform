import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateMachineCommandDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsIn(['toggle', 'range', 'select'])
  commandType: string;

  @IsOptional()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
