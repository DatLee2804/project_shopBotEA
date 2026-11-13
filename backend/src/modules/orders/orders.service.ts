import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CheckoutDto } from './dto/checkout.dto';
import * as crypto from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';
import { ProductType } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async checkout(dto: CheckoutDto, userId: string) {
    const isIndicator = dto.productType === ProductType.INDICATOR || Boolean(dto.indicatorId && !dto.botId);

    if (isIndicator) {
      if (!dto.indicatorId) {
        throw new HttpException(
          { errorCode: 'IND_001', message: 'Thiếu mã sản phẩm Indicator cần mua' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const indicator = await this.prisma.indicator.findUnique({
        where: { id: dto.indicatorId },
      });

      if (!indicator) {
        throw new HttpException(
          { errorCode: 'IND_001', message: 'Không tìm thấy Indicator yêu cầu' },
          HttpStatus.NOT_FOUND,
        );
      }

      if (indicator.status !== 'APPROVED') {
        throw new HttpException(
          { errorCode: 'IND_003', message: 'Indicator chưa được công khai nên không thể giao dịch' },
          HttpStatus.FORBIDDEN,
        );
      }

      const existingLicense = await this.prisma.license.findFirst({
        where: {
          userId,
          indicatorId: dto.indicatorId,
          isActive: true,
        },
      });

      if (existingLicense) {
        throw new HttpException(
          { errorCode: 'ORD_001', message: 'Bạn đã sở hữu bản quyền Indicator này rồi' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const isFree = Number(indicator.price) === 0;
      const result = await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,
            productType: ProductType.INDICATOR,
            indicatorId: indicator.id,
            amount: indicator.price,
            paymentMethod: isFree ? dto.paymentMethod || 'FREE' : dto.paymentMethod,
            status: 'COMPLETED',
            transactionId: `TXN-IND-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          },
        });

        if (!isFree) {
          await tx.user.update({
            where: { id: indicator.sellerId },
            data: {
              balance: { increment: new Decimal(Number(order.amount).toFixed(2)) },
            },
          });
        }

        const licenseKey = this.generateLicenseKey(ProductType.INDICATOR);
        const license = await tx.license.create({
          data: {
            licenseKey,
            userId,
            productType: ProductType.INDICATOR,
            indicatorId: indicator.id,
            isActive: true,
          },
        });

        return { order, license };
      });

      return { success: true, data: result };
    }

    // Luồng thanh toán cho BOT EA
    if (!dto.botId) {
      throw new HttpException(
        { errorCode: 'BOT_001', message: 'Thiếu mã sản phẩm Bot EA cần mua' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const bot = await this.prisma.bot.findUnique({
      where: { id: dto.botId },
    });

    if (!bot) {
      throw new HttpException(
        { errorCode: 'BOT_001', message: 'Không tìm thấy Bot EA yêu cầu' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (bot.status !== 'APPROVED') {
      throw new HttpException(
        { errorCode: 'BOT_003', message: 'Bot chưa được Admin phê duyệt nên không thể giao dịch' },
        HttpStatus.FORBIDDEN,
      );
    }

    const existingLicense = await this.prisma.license.findFirst({
      where: {
        userId,
        botId: dto.botId,
        isActive: true,
      },
    });

    if (existingLicense) {
      throw new HttpException(
        { errorCode: 'ORD_001', message: 'Bạn đã sở hữu bản quyền Bot này rồi' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isFree = Number(bot.price) === 0;
    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          productType: ProductType.BOT_EA,
          botId: bot.id,
          amount: bot.price,
          paymentMethod: isFree ? dto.paymentMethod || 'FREE' : dto.paymentMethod,
          status: 'COMPLETED',
          transactionId: `TXN-EA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        },
      });

      if (!isFree) {
        await tx.user.update({
          where: { id: bot.sellerId },
          data: {
            balance: { increment: new Decimal(Number(order.amount).toFixed(2)) },
          },
        });
      }

      const licenseKey = this.generateLicenseKey(ProductType.BOT_EA);
      const license = await tx.license.create({
        data: {
          licenseKey,
          userId,
          productType: ProductType.BOT_EA,
          botId: bot.id,
          isActive: true,
        },
      });

      return { order, license };
    });

    return {
      success: true,
      data: result,
    };
  }

  async handleWebhook(body: any) {
    const { orderId, transactionId, status } = body;

    if (status !== 'SUCCESS') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'FAILED' },
      });
      return { success: true, data: { message: 'Giao dịch thanh toán thất bại hoặc bị hủy' } };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          transactionId,
        },
        include: { bot: true, indicator: true },
      });

      const ownerId = order.bot?.sellerId || order.indicator?.sellerId;
      if (ownerId) {
        await tx.user.update({
          where: { id: ownerId },
          data: {
            balance: { increment: new Decimal(Number(order.amount).toFixed(2)) },
          },
        });
      }

      const licenseKey = this.generateLicenseKey(order.productType);
      const license = await tx.license.create({
        data: {
          licenseKey,
          userId: order.userId,
          productType: order.productType,
          botId: order.botId,
          indicatorId: order.indicatorId,
          isActive: true,
        },
      });

      return { order, license };
    });

    return {
      success: true,
      data: result,
    };
  }

  async getMyPurchases(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        bot: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            platform: true,
          },
        },
        indicator: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            platform: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: orders };
  }

  async getDownloadUrl(productId: string, userId: string) {
    // Kiểm tra quyền sở hữu trên cả Bot EA lẫn Indicator
    const license = await this.prisma.license.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ botId: productId }, { indicatorId: productId }],
      },
    });

    if (!license) {
      throw new HttpException(
        { errorCode: 'ORD_002', message: 'Bạn chưa sở hữu bản quyền sản phẩm này nên không thể tải file gốc' },
        HttpStatus.FORBIDDEN,
      );
    }

    if (license.productType === ProductType.INDICATOR && license.indicatorId) {
      const indicator = await this.prisma.indicator.findUnique({
        where: { id: license.indicatorId },
      });
      if (!indicator) {
        throw new HttpException(
          { errorCode: 'IND_001', message: 'Không tìm thấy Indicator yêu cầu' },
          HttpStatus.NOT_FOUND,
        );
      }
      const downloadUrl = await this.storageService.getPresignedDownloadUrl(indicator.fileKey);
      return { success: true, data: { downloadUrl } };
    }

    const bot = await this.prisma.bot.findUnique({
      where: { id: license.botId || productId },
    });

    if (!bot) {
      throw new HttpException(
        { errorCode: 'BOT_001', message: 'Không tìm thấy Bot EA yêu cầu' },
        HttpStatus.NOT_FOUND,
      );
    }

    const downloadUrl = await this.storageService.getPresignedDownloadUrl(bot.fileKey);
    return {
      success: true,
      data: { downloadUrl },
    };
  }

  private generateLicenseKey(type: ProductType = ProductType.BOT_EA): string {
    const segments = [];
    for (let i = 0; i < 3; i++) {
      segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
    }
    const prefix = type === ProductType.INDICATOR ? 'IND' : 'EA';
    return `${prefix}-${segments[0]}-${segments[1]}-${segments[2]}`;
  }
}
