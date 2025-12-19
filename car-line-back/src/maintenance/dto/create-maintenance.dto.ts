import {
  IsString,
  IsInt,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  serviceType: string;

  @IsInt()
  @Min(0)
  mileageAtService: number;

  @IsDateString()
  serviceDate: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsOptional()
  @IsString()
  description?: string;
}
