import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateFollowUpDto } from './dto/create-followup.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles('Admin', 'Sales')
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.customersService.findAll(pagination);
  }

  @Post()
  @Roles('Admin', 'Sales')
  create(@Body() createCustomerDto: CreateCustomerDto, @CurrentUser() user: any) {
    return this.customersService.create(createCustomerDto, user.id);
  }

  @Get(':id')
  @Roles('Admin', 'Sales')
  findById(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Put(':id')
  @Roles('Admin', 'Sales')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Post(':id/followups')
  @Roles('Admin', 'Sales')
  addFollowUp(
    @Param('id') id: string,
    @Body() createFollowUpDto: CreateFollowUpDto,
    @CurrentUser() user: any
  ) {
    return this.customersService.addFollowUp(id, createFollowUpDto, user.id);
  }

  @Get(':id/followups')
  @Roles('Admin', 'Sales')
  getFollowUps(@Param('id') id: string) {
    return this.customersService.getFollowUps(id);
  }
}
