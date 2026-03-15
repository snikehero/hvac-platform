import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
  IsNumber,
  IsObject,
} from 'class-validator';

export class CreateMachineVariableDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsIn(['number', 'string', 'boolean'])
  dataType: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  cardType?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsObject()
  cardConfig?: Record<string, unknown>;
}

export class CreateMachineTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  mqttTopic: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMachineVariableDto)
  variables: CreateMachineVariableDto[];
}
