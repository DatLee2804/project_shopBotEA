import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(
    @Body() dto: CheckoutDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.ordersService.checkout(dto, user.id);
  }

  @Public()
  @Post('webhook')
  handleWebhook(@Body() body: any) {
    return this.ordersService.handleWebhook(body);
  }

  @Get('my-purchases')
  getMyPurchases(@CurrentUser() user: { id: string }) {
    return this.ordersService.getMyPurchases(user.id);
  }

  @Get(':botId/download')
  getDownloadUrl(
    @Param('botId') botId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.ordersService.getDownloadUrl(botId, user.id);
  }
}
