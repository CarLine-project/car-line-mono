import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cars')
@UseGuards(JwtAuthGuard)
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() createCarDto: CreateCarDto) {
    return this.carsService.create(userId, createCarDto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.carsService.findAll(userId);
  }

  @Get('active')
  getActiveCar(@CurrentUser('id') userId: string) {
    return this.carsService.getActiveCar(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.carsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateCarDto: UpdateCarDto,
  ) {
    return this.carsService.update(id, userId, updateCarDto);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.carsService.activate(id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.carsService.remove(id, userId);
  }
}


