import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Brackets } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerFollowUp } from './entities/customer-followup.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateFollowUpDto } from './dto/create-followup.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerFollowUp)
    private followupRepository: Repository<CustomerFollowUp>,
  ) {}

  async findAll(pagination: PaginationQueryDto): Promise<PaginatedResponseDto<Customer>> {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.customerRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.creator', 'creator');

    if (search) {
      queryBuilder.where(new Brackets(qb => {
        qb.where('customer.name LIKE :search', { search: `%${search}%` })
          .orWhere('customer.mobile LIKE :search', { search: `%${search}%` })
          .orWhere('customer.businessName LIKE :search', { search: `%${search}%` })
          .orWhere('customer.email LIKE :search', { search: `%${search}%` });
      }));
    }

    const [data, total] = await queryBuilder
      .orderBy('customer.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // hide password
    data.forEach(d => {
      if(d.creator) d.creator.password = undefined;
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: { creator: true }
    });
    
    if (!customer) throw new NotFoundException('Customer not found');
    if(customer.creator) customer.creator.password = undefined;
    
    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto, userId: string): Promise<Customer> {
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      creator: { id: userId } as any
    });
    return await this.customerRepository.save(customer);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findById(id);
    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async addFollowUp(customerId: string, createFollowUpDto: CreateFollowUpDto, userId: string): Promise<CustomerFollowUp> {
    const customer = await this.findById(customerId);

    const followup = this.followupRepository.create({
      customer: { id: customerId } as any,
      notes: createFollowUpDto.notes,
      nextFollowUpDate: createFollowUpDto.nextFollowUpDate ? new Date(createFollowUpDto.nextFollowUpDate) : null,
      creator: { id: userId } as any
    });

    await this.followupRepository.save(followup);

    // Update customer
    customer.notes = createFollowUpDto.notes;
    if (createFollowUpDto.nextFollowUpDate) {
      customer.followUpDate = new Date(createFollowUpDto.nextFollowUpDate);
    }
    await this.customerRepository.save(customer);

    return followup;
  }

  async getFollowUps(customerId: string): Promise<CustomerFollowUp[]> {
    return this.followupRepository.find({
      where: { customer: { id: customerId } },
      relations: { creator: true },
      order: { createdAt: 'DESC' }
    });
  }
}
