import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { SalesChallan } from './entities/sales-challan.entity';
import { ChallanItem } from './entities/challan-item.entity';
import { CreateChallanDto } from './dto/create-challan.dto';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { Product } from '../products/entities/product.entity';
import { StockMovement } from '../products/entities/stock-movement.entity';

@Injectable()
export class ChallansService {
  constructor(
    @InjectRepository(SalesChallan)
    private challanRepository: Repository<SalesChallan>,
    private productsService: ProductsService,
    private customersService: CustomersService,
    private dataSource: DataSource
  ) {}

  private generateChallanNumber(): string {
    const date = new Date();
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CH-${yyyymmdd}-${random}`;
  }

  async findAll(pagination: PaginationQueryDto): Promise<PaginatedResponseDto<SalesChallan>> {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    const where = search ? { challanNumber: Like(`%${search}%`) } : {};

    const [data, total] = await this.challanRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<SalesChallan> {
    const challan = await this.challanRepository.findOne({
      where: { id },
      relations: { items: { product: true }, creator: true }
    });
    
    if (!challan) throw new NotFoundException('Challan not found');
    if(challan.creator) challan.creator.password = undefined;
    return challan;
  }

  async create(dto: CreateChallanDto, userId: string): Promise<SalesChallan> {
    const customer = await this.customersService.findById(dto.customerId);
    
    let totalQuantity = 0;
    let totalAmount = 0;
    
    const items: ChallanItem[] = [];
    
    for (const itemDto of dto.items) {
      const product = await this.productsService.findById(itemDto.productId);
      
      const item = new ChallanItem();
      item.product = product;
      item.productNameSnapshot = product.name;
      item.productSkuSnapshot = product.sku;
      item.productPriceSnapshot = product.unitPrice;
      item.quantity = itemDto.quantity;
      item.lineTotal = itemDto.quantity * product.unitPrice;
      
      totalQuantity += item.quantity;
      totalAmount += item.lineTotal;
      
      items.push(item);
    }
    
    const challan = this.challanRepository.create({
      challanNumber: this.generateChallanNumber(),
      customer,
      items,
      totalQuantity,
      totalAmount,
      status: 'Draft',
      creator: { id: userId } as any
    });
    
    return await this.challanRepository.save(challan);
  }

  async confirmChallan(id: string, userId: string): Promise<SalesChallan> {
    const challan = await this.findById(id);
    
    if (challan.status !== 'Draft') {
      throw new BadRequestException('Only Draft challans can be confirmed');
    }
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      for (const item of challan.items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: item.product.id } });
        if (!product) throw new NotFoundException(`Product ${item.productNameSnapshot} not found`);
        
        if (product.currentStock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}. Required: ${item.quantity}, Available: ${product.currentStock}`);
        }
        
        product.currentStock -= item.quantity;
        await queryRunner.manager.save(product);
        
        const movement = new StockMovement();
        movement.product = product;
        movement.quantity = item.quantity;
        movement.movementType = 'OUT';
        movement.reason = `Sales Challan: ${challan.challanNumber}`;
        movement.creator = { id: userId } as any;
        
        await queryRunner.manager.save(movement);
      }
      
      challan.status = 'Confirmed';
      await queryRunner.manager.save(challan);
      
      await queryRunner.commitTransaction();
      return challan;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelChallan(id: string, userId: string): Promise<SalesChallan> {
    const challan = await this.findById(id);
    
    if (challan.status === 'Cancelled') {
      throw new BadRequestException('Challan is already cancelled');
    }
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      if (challan.status === 'Confirmed') {
        // Restore stock
        for (const item of challan.items) {
          const product = await queryRunner.manager.findOne(Product, { where: { id: item.product.id } });
          if (product) {
            product.currentStock += item.quantity;
            await queryRunner.manager.save(product);
            
            const movement = new StockMovement();
            movement.product = product;
            movement.quantity = item.quantity;
            movement.movementType = 'IN';
            movement.reason = `Cancelled Challan: ${challan.challanNumber}`;
            movement.creator = { id: userId } as any;
            
            await queryRunner.manager.save(movement);
          }
        }
      }
      
      challan.status = 'Cancelled';
      await queryRunner.manager.save(challan);
      
      await queryRunner.commitTransaction();
      return challan;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
