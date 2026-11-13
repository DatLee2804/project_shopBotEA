import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new HttpException(
        { errorCode: 'AUTH_001', message: 'User not found' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return { success: true, data: user };
  }

  async upgradeToSeller(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(
        { errorCode: 'AUTH_001', message: 'User not found' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.role === Role.SELLER || user.role === Role.ADMIN) {
      throw new HttpException(
        { errorCode: 'AUTH_003', message: 'User is already a seller or admin' },
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.SELLER },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        balance: true,
      },
    });

    return { success: true, data: updatedUser };
  }
}
