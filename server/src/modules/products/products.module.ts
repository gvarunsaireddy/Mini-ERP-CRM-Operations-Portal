import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, StockMovement])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}
