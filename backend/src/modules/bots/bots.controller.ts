import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BotsService } from './bots.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotStatusDto } from './dto/update-bot-status.dto';
import { QueryBotsDto } from './dto/query-bots.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryBotsDto) {
    return this.botsService.findAll(query);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.botsService.findBySlug(slug);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @Post()
  create(
    @Body() dto: CreateBotDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.botsService.create(dto, user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @Post(':id/upload')
  upload(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.botsService.upload(id, user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBotStatusDto,
  ) {
    return this.botsService.updateStatus(id, dto);
  }
}
