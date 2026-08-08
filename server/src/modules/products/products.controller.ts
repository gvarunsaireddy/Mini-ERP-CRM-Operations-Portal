import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles('Admin', 'Warehouse', 'Accounts')
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.productsService.findAll(pagination);
  }

  @Post()
  @Roles('Admin', 'Warehouse')
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(createProductDto, user.id);
  }

  @Get(':id')
  @Roles('Admin', 'Warehouse', 'Accounts')
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Put(':id')
  @Roles('Admin', 'Warehouse')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Get(':id/stock-movements')
  @Roles('Admin', 'Warehouse', 'Accounts')
  getStockMovements(@Param('id') id: string, @Query() pagination: PaginationQueryDto) {
    return this.productsService.getStockMovements(id, pagination);
  }

  @Post(':id/stock-movements')
  @Roles('Admin', 'Warehouse')
  addStockMovement(
    @Param('id') id: string,
    @Body() dto: CreateStockMovementDto,
    @CurrentUser() user: any
  ) {
    return this.productsService.addStockMovement(id, dto, user.id);
  }
}
