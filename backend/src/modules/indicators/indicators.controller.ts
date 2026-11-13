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
import { IndicatorsService } from './indicators.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorStatusDto } from './dto/update-indicator-status.dto';
import { QueryIndicatorsDto } from './dto/query-indicators.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryIndicatorsDto) {
    return this.indicatorsService.findAll(query);
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.indicatorsService.findBySlug(slug);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @Post()
  create(
    @Body() dto: CreateIndicatorDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.indicatorsService.create(dto, user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @Post(':id/upload')
  upload(@Param('id') id: string) {
    return this.indicatorsService.upload(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateIndicatorStatusDto,
  ) {
    return this.indicatorsService.updateStatus(id, dto);
  }
}

