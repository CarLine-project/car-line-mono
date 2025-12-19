import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MileageService } from './mileage.service';
import { MileageController } from './mileage.controller';
import { Mileage } from './entities/mileage.entity';
import { CarsModule } from '../cars/cars.module';

@Module({
  imports: [TypeOrmModule.forFeature([Mileage]), CarsModule],
  controllers: [MileageController],
  providers: [MileageService],
  exports: [MileageService],
})
export class MileageModule {}


