import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Brackets, LessThanOrEqual } from 'typeorm';
import { Product } from './entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
  ) {}

  async findAll(pagination: PaginationQueryDto): Promise<PaginatedResponseDto<Product>> {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.creator', 'creator');

    if (search) {
      queryBuilder.where(new Brackets(qb => {
        qb.where('product.name LIKE :search', { search: `%${search}%` })
          .orWhere('product.sku LIKE :search', { search: `%${search}%` })
          .orWhere('product.category LIKE :search', { search: `%${search}%` });
      }));
    }

    const [data, total] = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    data.forEach(d => {
      if(d.creator) d.creator.password = undefined;
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { creator: true }
    });
    
    if (!product) throw new NotFoundException('Product not found');
    if(product.creator) product.creator.password = undefined;
    
    return product;
  }

  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      creator: { id: userId } as any
    });
    return await this.productRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async getStockMovements(productId: string, pagination: PaginationQueryDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.stockMovementRepository.findAndCount({
      where: { product: { id: productId } },
      relations: { creator: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    });

    data.forEach(d => {
      if(d.creator) d.creator.password = undefined;
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async addStockMovement(productId: string, dto: CreateStockMovementDto, userId: string): Promise<StockMovement> {
    const product = await this.findById(productId);

    if (dto.movementType === 'OUT' && product.currentStock < dto.quantity) {
      throw new BadRequestException(`Insufficient stock. Current stock: ${product.currentStock}`);
    }

    const movement = this.stockMovementRepository.create({
      product: { id: productId } as any,
      quantity: dto.quantity,
      movementType: dto.movementType,
      reason: dto.reason,
      creator: { id: userId } as any
    });

    await this.stockMovementRepository.save(movement);

    if (dto.movementType === 'IN') {
      product.currentStock += dto.quantity;
    } else {
      product.currentStock -= dto.quantity;
    }
    
    await this.productRepository.save(product);
    return movement;
  }

  async getLowStockProducts() {
    return this.productRepository.createQueryBuilder('product')
      .where('product.currentStock <= product.minStockAlert')
      .getMany();
  }
}
