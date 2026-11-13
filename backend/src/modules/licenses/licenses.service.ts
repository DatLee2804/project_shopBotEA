import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VerifyLicenseDto } from './dto/verify-license.dto';

@Injectable()
export class LicensesService {
  constructor(private prisma: PrismaService) {}

  async getMyLicenses(userId: string) {
    const licenses = await this.prisma.license.findMany({
      where: { userId },
      include: {
        bot: {
          select: {
            id: true,
            title: true,
            slug: true,
            platform: true,
            version: true,
          },
        },
        indicator: {
          select: {
            id: true,
            title: true,
            slug: true,
            platform: true,
            version: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: licenses };
  }

  async resetAccount(licenseId: string, userId: string) {
    const license = await this.prisma.license.findUnique({
      where: { id: licenseId },
    });

    if (!license) {
      throw new HttpException(
        { errorCode: 'LIC_001', message: 'Mã License Key không tồn tại' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (license.userId !== userId) {
      throw new HttpException(
        { errorCode: 'AUTH_003', message: 'Tài khoản không có quyền thực hiện hành động này' },
        HttpStatus.FORBIDDEN,
      );
    }

    if (!license.isActive) {
      throw new HttpException(
        { errorCode: 'LIC_003', message: 'License Key đã hết hạn sử dụng hoặc bị khóa bởi Admin' },
        HttpStatus.FORBIDDEN,
      );
    }

    if (license.resetCount >= 2) {
      throw new HttpException(
        { errorCode: 'LIC_004', message: 'Đã vượt quá số lần Reset tài khoản cho phép trong tháng' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedLicense = await this.prisma.license.update({
      where: { id: licenseId },
      data: {
        mtAccountNo: null,
        resetCount: { increment: 1 },
      },
    });

    return { success: true, data: updatedLicense };
  }

  async verify(dto: VerifyLicenseDto) {
    const account = dto.accountNumber || dto.mtAccountNo;

    const license = await this.prisma.license.findUnique({
      where: { licenseKey: dto.licenseKey },
      include: {
        bot: {
          select: {
            id: true,
            title: true,
            version: true,
          },
        },
        indicator: {
          select: {
            id: true,
            title: true,
            version: true,
          },
        },
      },
    });

    if (!license) {
      throw new HttpException(
        { errorCode: 'LIC_001', message: 'Mã License Key không tồn tại' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!license.isActive) {
      throw new HttpException(
        { errorCode: 'LIC_003', message: 'License Key đã hết hạn sử dụng hoặc bị khóa bởi Admin' },
        HttpStatus.FORBIDDEN,
      );
    }

    if (license.expiresAt && license.expiresAt < new Date()) {
      throw new HttpException(
        { errorCode: 'LIC_003', message: 'License Key đã hết hạn sử dụng hoặc bị khóa bởi Admin' },
        HttpStatus.FORBIDDEN,
      );
    }

    if (dto.botId && license.botId !== dto.botId) {
      throw new HttpException(
        { errorCode: 'LIC_001', message: 'License Key không khớp với Bot EA này' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (dto.indicatorId && license.indicatorId !== dto.indicatorId) {
      throw new HttpException(
        { errorCode: 'LIC_001', message: 'License Key không khớp với Indicator này' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (account) {
      if (license.mtAccountNo && license.mtAccountNo !== account) {
        throw new HttpException(
          {
            errorCode: 'LIC_002',
            message: 'License Key đã bị khóa cứng cho một số tài khoản MT4/MT5 khác',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      if (!license.mtAccountNo) {
        await this.prisma.license.update({
          where: { id: license.id },
          data: { mtAccountNo: account },
        });
        license.mtAccountNo = account;
      }
    }

    return {
      success: true,
      data: {
        valid: true,
        productType: license.productType,
        licenseKey: license.licenseKey,
        bot: license.bot,
        indicator: license.indicator,
        mtAccountNo: license.mtAccountNo,
      },
    };
  }
}
