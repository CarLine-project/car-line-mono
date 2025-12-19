import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CarsService } from '../cars/cars.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
    private readonly carsService: CarsService,
  ) {}

  @Post('cars/:carId/maintenance')
  async create(
    @Param('carId') carId: string,
    @CurrentUser('id') userId: string,
    @Body() createMaintenanceDto: CreateMaintenanceDto,
  ) {
    await this.carsService.verifyOwnership(carId, userId);
    return this.maintenanceService.create(carId, createMaintenanceDto);
  }

  @Get('cars/:carId/maintenance')
  async findAll(
    @Param('carId') carId: string,
    @CurrentUser('id') userId: string,
    @Query() query: QueryMaintenanceDto,
  ) {
    await this.carsService.verifyOwnership(carId, userId);
    return this.maintenanceService.findAll(carId, query);
  }

  @Get('cars/:carId/maintenance/next')
  async getNextRecommendation(
    @Param('carId') carId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.carsService.verifyOwnership(carId, userId);
    return this.maintenanceService.getNextMaintenanceRecommendation(carId);
  }

  @Get('maintenance/:id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const maintenance = await this.maintenanceService.findOne(id);
    await this.carsService.verifyOwnership(maintenance.carId, userId);
    return maintenance;
  }

  @Patch('maintenance/:id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceDto,
  ) {
    const maintenance = await this.maintenanceService.findOne(id);
    await this.carsService.verifyOwnership(maintenance.carId, userId);
    return this.maintenanceService.update(id, updateMaintenanceDto);
  }

  @Delete('maintenance/:id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const maintenance = await this.maintenanceService.findOne(id);
    await this.carsService.verifyOwnership(maintenance.carId, userId);
    return this.maintenanceService.remove(id);
  }

  @Get('maintenance')
  async findAllForUser(
    @CurrentUser('id') userId: string,
    @Query() query: QueryMaintenanceDto & { carId?: string },
  ) {
    return this.maintenanceService.findAllForUser(userId, query);
  }
}
