import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Kết nối cơ sở dữ liệu PostgreSQL thành công qua Prisma.');
    } catch (error: any) {
      this.logger.warn(
        `⚠️ Chưa thể kết nối PostgreSQL (${error.message?.split('\n')?.[0] || 'Connection failed'}). ` +
          'Server vẫn đang chạy bình thường. Hãy đảm bảo PostgreSQL đã được khởi động và cấu hình đúng DATABASE_URL trong backend/.env.',
      );
    }
  }
}
