import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(pagination: PaginationQueryDto): Promise<PaginatedResponseDto<User>> {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    const where = search ? [
      { name: Like(`%${search}%`) },
      { email: Like(`%${search}%`) }
    ] : {};

    const [users, total] = await this.usersRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    // Remove passwords from response
    const data = users.map(user => {
      const { password, ...result } = user;
      return result as User;
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);

    const { password, ...result } = user;
    return result as User;
  }
}
