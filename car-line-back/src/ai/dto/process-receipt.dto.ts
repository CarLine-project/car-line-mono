import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class ProcessReceiptDto {
  @IsString()
  @IsNotEmpty()
  image: string; // Base64 encoded image

  @IsUUID()
  @IsNotEmpty()
  carId: string;
}
