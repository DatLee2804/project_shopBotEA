import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BotsModule } from './modules/bots/bots.module';
import { IndicatorsModule } from './modules/indicators/indicators.module';
import { StorageModule } from './modules/storage/storage.module';
import { OrdersModule } from './modules/orders/orders.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    BotsModule,
    IndicatorsModule,
    StorageModule,
    OrdersModule,
    LicensesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
