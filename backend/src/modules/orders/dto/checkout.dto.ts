import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ProductType } from '@prisma/client';

export class CheckoutDto {
  @IsEnum(ProductType)
  @IsOptional()
  productType?: ProductType;

  @IsString()
  @IsOptional()
  botId?: string;

  @IsString()
  @IsOptional()
  indicatorId?: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}
