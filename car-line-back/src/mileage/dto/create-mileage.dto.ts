import { IsInt, IsDateString, IsOptional, IsString, Min } from 'class-validator';

export class CreateMileageDto {
  @IsInt()
  @Min(0)
  value: number;

  @IsDateString()
  recordedAt: string;

  @IsOptional()
  @IsString()
  comment?: string;
}


