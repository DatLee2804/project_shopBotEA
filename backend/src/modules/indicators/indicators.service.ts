import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorStatusDto } from './dto/update-indicator-status.dto';
import { QueryIndicatorsDto } from './dto/query-indicators.dto';
import slugify from 'slugify';
import { Prisma, Platform } from '@prisma/client';

@Injectable()
export class IndicatorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryIndicatorsDto) {
    const {
      search,
      platform,
      category,
      status,
      minAccuracy,
      nonRepaint,
      sort,
      page = 1,
      limit = 12,
    } = query;

    const where: Prisma.IndicatorWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDesc: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (platform && platform !== 'ALL') {
      if (platform === 'MT4') {
        where.platform = { in: [Platform.MT4, Platform.BOTH] };
      } else if (platform === 'MT5') {
        where.platform = { in: [Platform.MT5, Platform.BOTH] };
      } else if (platform === 'BOTH') {
        where.platform = Platform.BOTH;
      }
    }

    if (category) {
      where.category = category;
    }

    if (minAccuracy !== undefined && minAccuracy !== null) {
      where.accuracyRate = { gte: Number(minAccuracy) };
    }

    if (nonRepaint === 'true') {
      where.isNonRepaint = true;
    }

    where.status = status || 'APPROVED';

    let orderBy: Prisma.IndicatorOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'popular') {
      orderBy = { accuracyRate: 'desc' };
    }

    const [indicators, total] = await Promise.all([
      this.prisma.indicator.findMany({
        where,
        include: {
          seller: {
            select: { id: true, fullName: true, email: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.indicator.count({ where }),
    ]);

    return {
      success: true,
      data: indicators,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async findBySlug(slug: string) {
    const indicator = await this.prisma.indicator.findUnique({
      where: { slug },
      include: {
        seller: {
          select: { id: true, fullName: true, email: true },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!indicator) {
      throw new HttpException(
        { errorCode: 'IND_001', message: 'Không tìm thấy Chỉ báo (Indicator) yêu cầu' },
        HttpStatus.NOT_FOUND,
      );
    }

    return { success: true, data: indicator };
  }

  async create(dto: CreateIndicatorDto, sellerId: string) {
    let slug = slugify(dto.title, { lower: true, strict: true });

    const existing = await this.prisma.indicator.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const indicator = await this.prisma.indicator.create({
      data: {
        title: dto.title,
        slug,
        shortDesc: dto.shortDesc,
        description: dto.description || '',
        price: dto.price || 0,
        platform: dto.platform || 'MT5',
        version: dto.version || '1.0.0',
        fileKey: dto.fileKey || `indicators/${slug}/main.ex5`,
        demoFileKey: dto.demoFileKey,
        thumbnailUrl: dto.thumbnailUrl,
        category: dto.category || 'TREND_SIGNAL',
        accuracyRate: dto.accuracyRate || 0,
        isNonRepaint: dto.isNonRepaint ?? true,
        hasAlert: dto.hasAlert ?? true,
        timeframes: dto.timeframes || 'M5, M15, H1, H4',
        status: 'APPROVED',
        sellerId,
      },
    });

    return { success: true, data: indicator };
  }

  async upload(indicatorId: string) {
    const indicator = await this.prisma.indicator.findUnique({
      where: { id: indicatorId },
    });

    if (!indicator) {
      throw new HttpException(
        { errorCode: 'IND_001', message: 'Không tìm thấy Indicator yêu cầu' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      data: {
        message: 'Indicator upload endpoint ready',
        indicatorId: indicator.id,
      },
    };
  }

  async updateStatus(indicatorId: string, dto: UpdateIndicatorStatusDto) {
    const indicator = await this.prisma.indicator.findUnique({
      where: { id: indicatorId },
    });

    if (!indicator) {
      throw new HttpException(
        { errorCode: 'IND_001', message: 'Không tìm thấy Indicator yêu cầu' },
        HttpStatus.NOT_FOUND,
      );
    }

    const updated = await this.prisma.indicator.update({
      where: { id: indicatorId },
      data: { status: dto.status },
    });

    return { success: true, data: updated };
  }
}

