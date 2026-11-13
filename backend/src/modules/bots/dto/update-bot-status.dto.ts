import { IsEnum } from 'class-validator';
import { BotStatus } from '@prisma/client';

export class UpdateBotStatusDto {
  @IsEnum(BotStatus)
  status: BotStatus;
}
