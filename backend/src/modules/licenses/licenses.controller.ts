import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { VerifyLicenseDto } from './dto/verify-license.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Get('my-licenses')
  getMyLicenses(@CurrentUser() user: { id: string }) {
    return this.licensesService.getMyLicenses(user.id);
  }

  @Patch(':id/reset-account')
  resetAccount(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.licensesService.resetAccount(id, user.id);
  }

  @Public()
  @Post('verify')
  verify(@Body() dto: VerifyLicenseDto) {
    return this.licensesService.verify(dto);
  }
}
