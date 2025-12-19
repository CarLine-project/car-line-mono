import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryCarDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: string }) => value === 'true')
  isActive?: boolean;
}
