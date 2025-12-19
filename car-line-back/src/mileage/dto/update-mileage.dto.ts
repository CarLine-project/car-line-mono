import { PartialType } from '@nestjs/mapped-types';
import { CreateMileageDto } from './create-mileage.dto';

export class UpdateMileageDto extends PartialType(CreateMileageDto) {}


