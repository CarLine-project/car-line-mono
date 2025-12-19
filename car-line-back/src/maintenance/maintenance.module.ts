import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { Maintenance } from './entities/maintenance.entity';
import { CarsModule } from '../cars/cars.module';
import { MileageModule } from '../mileage/mileage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Maintenance]), CarsModule, MileageModule],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
