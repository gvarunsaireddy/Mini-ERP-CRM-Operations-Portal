import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallansService } from './challans.service';
import { ChallansController } from './challans.controller';
import { SalesChallan } from './entities/sales-challan.entity';
import { ChallanItem } from './entities/challan-item.entity';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesChallan, ChallanItem]),
    ProductsModule,
    CustomersModule
  ],
  controllers: [ChallansController],
  providers: [ChallansService],
  exports: [ChallansService]
})
export class ChallansModule {}
