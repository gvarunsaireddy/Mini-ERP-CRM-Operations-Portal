import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { SalesChallan } from '../challans/entities/sales-challan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Product, SalesChallan])],
  controllers: [DashboardController]
})
export class DashboardModule {}
