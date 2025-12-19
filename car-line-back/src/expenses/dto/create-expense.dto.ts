import {
  IsUUID,
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @IsUUID()
  categoryId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  expenseDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
