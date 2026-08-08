import { IsString, IsInt, Min, IsEnum } from 'class-validator';

export class CreateStockMovementDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  movementType: string;

  @IsString()
  reason: string;
}
