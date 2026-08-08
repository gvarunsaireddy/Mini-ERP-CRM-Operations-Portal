import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateFollowUpDto {
  @IsString()
  notes: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpDate?: string;
}
