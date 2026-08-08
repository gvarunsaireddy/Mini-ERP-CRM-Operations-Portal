import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ChallansService } from './challans.service';
import { CreateChallanDto } from './dto/create-challan.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/challans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChallansController {
  constructor(private readonly challansService: ChallansService) {}

  @Get()
  @Roles('Admin', 'Sales', 'Warehouse', 'Accounts')
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.challansService.findAll(pagination);
  }

  @Post()
  @Roles('Admin', 'Sales')
  create(@Body() createChallanDto: CreateChallanDto, @CurrentUser() user: any) {
    return this.challansService.create(createChallanDto, user.id);
  }

  @Get(':id')
  @Roles('Admin', 'Sales', 'Warehouse', 'Accounts')
  findById(@Param('id') id: string) {
    return this.challansService.findById(id);
  }

  @Patch(':id/confirm')
  @Roles('Admin', 'Sales')
  confirmChallan(@Param('id') id: string, @CurrentUser() user: any) {
    return this.challansService.confirmChallan(id, user.id);
  }

  @Patch(':id/cancel')
  @Roles('Admin')
  cancelChallan(@Param('id') id: string, @CurrentUser() user: any) {
    return this.challansService.cancelChallan(id, user.id);
  }
}
