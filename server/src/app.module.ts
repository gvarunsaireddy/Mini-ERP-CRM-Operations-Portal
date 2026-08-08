import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ProductsModule } from './modules/products/products.module';
import { ChallansModule } from './modules/challans/challans.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get<string>('DB_PATH', './data/erp.sqlite'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CustomersModule,
    ProductsModule,
    ChallansModule,
    DashboardModule,
  ],
})
export class AppModule {}
