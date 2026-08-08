import { IsString, IsEmail, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsString()
  mobile: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsString()
  customerType: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
