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
import { MileageService } from './mileage.service';
import { CreateMileageDto } from './dto/create-mileage.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';
import { QueryMileageDto } from './dto/query-mileage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CarsService } from '../cars/cars.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class MileageController {
  constructor(
    private readonly mileageService: MileageService,
    private readonly carsService: CarsService,
  ) {}

  @Post('cars/:carId/mileage')
  async create(
    @Param('carId') carId: string,
    @CurrentUser('id') userId: string,
    @Body() createMileageDto: CreateMileageDto,
  ) {
    // Verify car ownership
    await this.carsService.verifyOwnership(carId, userId);
    return this.mileageService.create(carId, createMileageDto);
  }

  @Get('cars/:carId/mileage')
  async findAll(
    @Param('carId') carId: string,
    @CurrentUser('id') userId: string,
    @Query() query: QueryMileageDto,
  ) {
    // Verify car ownership
    await this.carsService.verifyOwnership(carId, userId);
    return this.mileageService.findAll(carId, query);
  }

  @Get('cars/:carId/mileage/current')
  async getCurrentMileage(
    @Param('carId') carId: string,
    @CurrentUser('id') userId: string,
  ) {
    // Verify car ownership
    await this.carsService.verifyOwnership(carId, userId);
    return this.mileageService.getCurrentMileage(carId);
  }

  @Get('mileage/:id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const mileage = await this.mileageService.findOne(id);
    // Verify car ownership through the mileage record
    await this.carsService.verifyOwnership(mileage.carId, userId);
    return mileage;
  }

  @Patch('mileage/:id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateMileageDto: UpdateMileageDto,
  ) {
    const mileage = await this.mileageService.findOne(id);
    // Verify car ownership through the mileage record
    await this.carsService.verifyOwnership(mileage.carId, userId);
    return this.mileageService.update(id, updateMileageDto);
  }

  @Delete('mileage/:id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const mileage = await this.mileageService.findOne(id);
    // Verify car ownership through the mileage record
    await this.carsService.verifyOwnership(mileage.carId, userId);
    return this.mileageService.remove(id);
  }
}


