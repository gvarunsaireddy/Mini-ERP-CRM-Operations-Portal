import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { SalesChallan } from '../challans/entities/sales-challan.entity';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(SalesChallan) private challanRepo: Repository<SalesChallan>,
  ) {}

  @Get('stats')
  async getStats() {
    const totalCustomers = await this.customerRepo.count();
    const totalProducts = await this.productRepo.count();
    
    const lowStockCount = await this.productRepo.createQueryBuilder('product')
      .where('product.currentStock <= product.minStockAlert')
      .getCount();
      
    const totalChallans = await this.challanRepo.count();
    
    const recentChallans = await this.challanRepo.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: { customer: true }
    });

    const customersByStatusRaw = await this.customerRepo.createQueryBuilder('customer')
      .select('customer.status', 'status')
      .addSelect('COUNT(customer.id)', 'count')
      .groupBy('customer.status')
      .getRawMany();

    const customersByStatus = customersByStatusRaw.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.count, 10);
      return acc;
    }, {});

    return {
      totalCustomers,
      totalProducts,
      lowStockCount,
      totalChallans,
      recentChallans,
      customersByStatus
    };
  }
}
