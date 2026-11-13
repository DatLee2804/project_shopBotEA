import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { Platform, IndicatorCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateIndicatorDto {
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
  @IsOptional()
  fileKey?: string;

  @IsString()
  @IsOptional()
  demoFileKey?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsEnum(IndicatorCategory)
  @IsOptional()
  category?: IndicatorCategory;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  accuracyRate?: number;

  @IsBoolean()
  @IsOptional()
  isNonRepaint?: boolean;

  @IsBoolean()
  @IsOptional()
  hasAlert?: boolean;

  @IsString()
  @IsOptional()
  timeframes?: string;
}

