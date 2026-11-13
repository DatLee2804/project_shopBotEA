import { IsOptional, IsString, IsEnum, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { BotStatus } from '@prisma/client';

export class QueryBotsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsEnum(BotStatus)
  status?: BotStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minWinRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxDrawdown?: number;

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

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
