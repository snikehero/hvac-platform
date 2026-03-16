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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateMachineCommandDto } from './create-machine-command.dto';

export class CreateMachineVariableDto {
  @ApiProperty({ description: 'Unique key for this variable (e.g. "temperature")' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Display label (e.g. "Temperature")' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ enum: ['number', 'string', 'boolean'], description: 'Data type of the variable' })
  @IsIn(['number', 'string', 'boolean'])
  dataType: string;

  @ApiPropertyOptional({ description: 'Unit of measure (e.g. "°C")' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Card component type for rendering (e.g. "temperature")' })
  @IsOptional()
  @IsString()
  cardType?: string;

  @ApiPropertyOptional({ description: 'Accent color key (e.g. "primary")' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Display order (ascending)' })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Card-specific configuration (thresholds, min/max, etc.)' })
  @IsOptional()
  @IsObject()
  cardConfig?: Record<string, unknown>;
}

export class CreateMachineTypeDto {
  @ApiProperty({ description: 'Human-readable machine type name (e.g. "HVAC")' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'URL-safe slug identifier (e.g. "hvac")' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: 'MQTT topic pattern for this machine type (e.g. "hvac/+/+/data")' })
  @IsString()
  @IsNotEmpty()
  mqttTopic: string;

  @ApiPropertyOptional({ description: 'Optional description shown in the UI' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Lucide icon name (e.g. "AirVent")' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ type: [CreateMachineVariableDto], description: 'Variable definitions for this machine type' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMachineVariableDto)
  variables: CreateMachineVariableDto[];

  @ApiPropertyOptional({ type: [CreateMachineCommandDto], description: 'Command definitions for this machine type' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMachineCommandDto)
  commands?: CreateMachineCommandDto[];
}
