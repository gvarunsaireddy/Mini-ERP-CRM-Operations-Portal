import { IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ChallanItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateChallanDto {
  @IsString()
  customerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChallanItemDto)
  items: ChallanItemDto[];
}
