import { IsOptional, IsString, IsEnum, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { IndicatorCategory, IndicatorStatus } from '@prisma/client';

export class QueryIndicatorsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsEnum(IndicatorCategory)
  category?: IndicatorCategory;

  @IsOptional()
  @IsEnum(IndicatorStatus)
  status?: IndicatorStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minAccuracy?: number;

  @IsOptional()
  @IsString()
  nonRepaint?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 12;
}

