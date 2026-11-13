import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotStatusDto } from './dto/update-bot-status.dto';
import { QueryBotsDto } from './dto/query-bots.dto';
import slugify from 'slugify';
import { Prisma, Platform } from '@prisma/client';

@Injectable()
export class BotsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryBotsDto) {
    const {
      search,
      platform,
      status,
      minWinRate,
      maxDrawdown,
      sort,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.BotWhereInput = {};

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

    if (minWinRate !== undefined && minWinRate !== null) {
      where.winRate = { gte: Number(minWinRate) };
    }

    if (maxDrawdown !== undefined && maxDrawdown !== null) {
      where.maxDrawdown = { lte: Number(maxDrawdown) };
    }

    if (status) {
      where.status = status;
    } else {
      where.status = 'APPROVED';
    }

    let orderBy: Prisma.BotOrderByWithRelationInput = { [sortBy]: sortOrder };

    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'popular') {
      orderBy = { winRate: 'desc' };
    }

    const [bots, total] = await Promise.all([
      this.prisma.bot.findMany({
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
      this.prisma.bot.count({ where }),
    ]);

    return {
      success: true,
      data: bots,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async findBySlug(slug: string) {
    const bot = await this.prisma.bot.findUnique({
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

    if (!bot) {
      throw new HttpException(
        { errorCode: 'BOT_001', message: 'Không tìm thấy Bot EA yêu cầu' },
        HttpStatus.NOT_FOUND,
      );
    }

    return { success: true, data: bot };
  }

  async create(dto: CreateBotDto, sellerId: string) {
    let slug = slugify(dto.title, { lower: true, strict: true });

    // Ensure slug uniqueness
    const existingBot = await this.prisma.bot.findUnique({ where: { slug } });
    if (existingBot) {
      slug = `${slug}-${Date.now()}`;
    }

    const bot = await this.prisma.bot.create({
      data: {
        title: dto.title,
        slug,
        shortDesc: dto.shortDesc,
        description: dto.description || '',
        price: dto.price || 0,
        platform: dto.platform || 'MT5',
        version: dto.version || '1.0.0',
        fileKey: dto.fileKey || `bots/${slug}/main.ex5`,
        demoFileKey: dto.demoFileKey,
        thumbnailUrl: dto.thumbnailUrl,
        winRate: dto.winRate || 0,
        maxDrawdown: dto.maxDrawdown || 0,
        profitFactor: dto.profitFactor || 0,
        sellerId,
      },
    });

    return { success: true, data: bot };
  }

  async upload(botId: string, sellerId: string) {
    const bot = await this.prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      throw new HttpException(
        { errorCode: 'BOT_001', message: 'Không tìm thấy Bot EA yêu cầu' },
        HttpStatus.NOT_FOUND,
      );
    }

    if (bot.sellerId !== sellerId) {
      throw new HttpException(
        { errorCode: 'BOT_004', message: 'Bạn không phải là tác giả của Bot này' },
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      success: true,
      data: {
        message: 'Upload endpoint ready',
        botId: bot.id,
      },
    };
  }

  async updateStatus(botId: string, dto: UpdateBotStatusDto) {
    const bot = await this.prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      throw new HttpException(
        { errorCode: 'BOT_001', message: 'Không tìm thấy Bot EA yêu cầu' },
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedBot = await this.prisma.bot.update({
      where: { id: botId },
      data: { status: dto.status },
    });

    return { success: true, data: updatedBot };
  }
}
