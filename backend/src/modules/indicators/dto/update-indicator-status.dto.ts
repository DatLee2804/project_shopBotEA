import { IsEnum } from 'class-validator';
import { IndicatorStatus } from '@prisma/client';

export class UpdateIndicatorStatusDto {
  @IsEnum(IndicatorStatus)
  status: IndicatorStatus;
}

