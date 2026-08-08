import { IsString, IsNumber, IsInt, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsInt()
  @Min(0)
  minStockAlert: number;

  @IsString()
  warehouseLocation: string;
}
