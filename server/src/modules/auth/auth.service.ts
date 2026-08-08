import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const { password, ...result } = user;

    return {
      token: this.jwtService.sign(payload),
      user: result
    };
  }

  async register(registerDto: RegisterDto) {
    const newUser = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
      role: registerDto.role || 'Sales'
    });

    const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };

    return {
      token: this.jwtService.sign(payload),
      user: newUser
    };
  }

  async validateUser(payload: any) {
    return await this.usersService.findById(payload.sub);
  }
}
