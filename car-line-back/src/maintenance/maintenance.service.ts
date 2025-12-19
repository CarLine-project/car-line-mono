import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';
import { MileageService } from '../mileage/mileage.service';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
    private mileageService: MileageService,
  ) {}

  async create(
    carId: string,
    createMaintenanceDto: CreateMaintenanceDto,
  ): Promise<Maintenance> {
    const maintenance = this.maintenanceRepository.create({
      ...createMaintenanceDto,
      carId,
    });
    return await this.maintenanceRepository.save(maintenance);
  }

  async findAll(
    carId: string,
    query: QueryMaintenanceDto,
  ): Promise<{
    data: Maintenance[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.maintenanceRepository.findAndCount({
      where: { carId },
      order: { serviceDate: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
    });
    if (!maintenance) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`);
    }
    return maintenance;
  }

  async update(
    id: string,
    updateMaintenanceDto: UpdateMaintenanceDto,
  ): Promise<Maintenance> {
    const maintenance = await this.findOne(id);
    Object.assign(maintenance, updateMaintenanceDto);
    return await this.maintenanceRepository.save(maintenance);
  }

  async remove(id: string): Promise<void> {
    const maintenance = await this.findOne(id);
    await this.maintenanceRepository.remove(maintenance);
  }

  async getNextMaintenanceRecommendation(carId: string): Promise<{
    recommended: boolean;
    reason: string;
    suggestedMileage: number | null;
    suggestedDate: Date | null;
  }> {
    const lastMaintenance = await this.getLastMaintenance(carId);
    const currentMileage = await this.mileageService.getCurrentMileage(carId);

    if (!lastMaintenance) {
      return {
        recommended: true,
        reason: 'Немає записів про технічне обслуговування',
        suggestedMileage: currentMileage
          ? currentMileage.value + 10000
          : null,
        suggestedDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      };
    }

    const mileageSinceLastService = currentMileage
      ? currentMileage.value - lastMaintenance.mileageAtService
      : 0;
    const daysSinceLastService = Math.floor(
      (Date.now() - new Date(lastMaintenance.serviceDate).getTime()) /
        (24 * 60 * 60 * 1000),
    );

    const recommended =
      mileageSinceLastService >= 10000 || daysSinceLastService >= 180;

    let reason = '';
    if (mileageSinceLastService >= 10000) {
      reason = `Пробіг з останнього ТО: ${mileageSinceLastService} км`;
    } else if (daysSinceLastService >= 180) {
      reason = `Минуло ${daysSinceLastService} днів з останнього ТО`;
    } else {
      reason = `Наступне ТО через ${10000 - mileageSinceLastService} км або ${180 - daysSinceLastService} днів`;
    }

    return {
      recommended,
      reason,
      suggestedMileage: lastMaintenance.mileageAtService + 10000,
      suggestedDate: new Date(
        new Date(lastMaintenance.serviceDate).getTime() +
          180 * 24 * 60 * 60 * 1000,
      ),
    };
  }

  private async getLastMaintenance(carId: string): Promise<Maintenance | null> {
    return await this.maintenanceRepository.findOne({
      where: { carId },
      order: { serviceDate: 'DESC', createdAt: 'DESC' },
    });
  }
}
