import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { Platform } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateBotDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  shortDesc: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @IsString()
  @IsOptional()
  demoFileKey?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  winRate?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxDrawdown?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  profitFactor?: number;
}
