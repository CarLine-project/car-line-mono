import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from './entities/car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
  ) {}

  async create(userId: string, createCarDto: CreateCarDto): Promise<Car> {
    const car = this.carsRepository.create({
      ...createCarDto,
      userId,
    });
    return await this.carsRepository.save(car);
  }

  async findAll(userId: string): Promise<Car[]> {
    return await this.carsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Car> {
    const car = await this.carsRepository.findOne({
      where: { id, userId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }

  async update(
    id: string,
    userId: string,
    updateCarDto: UpdateCarDto,
  ): Promise<Car> {
    const car = await this.findOne(id, userId);
    Object.assign(car, updateCarDto);
    return await this.carsRepository.save(car);
  }

  async remove(id: string, userId: string): Promise<void> {
    const car = await this.findOne(id, userId);
    await this.carsRepository.remove(car);
  }

  async activate(id: string, userId: string): Promise<Car> {
    // Deactivate all user's cars
    await this.carsRepository.update({ userId }, { isActive: false });

    // Activate the selected car
    const car = await this.findOne(id, userId);
    car.isActive = true;
    return await this.carsRepository.save(car);
  }

  async getActiveCar(userId: string): Promise<Car | null> {
    return await this.carsRepository.findOne({
      where: { userId, isActive: true },
    });
  }

  async verifyOwnership(carId: string, userId: string): Promise<Car> {
    const car = await this.carsRepository.findOne({
      where: { id: carId },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    if (car.userId !== userId) {
      throw new ForbiddenException('Access denied to this car');
    }

    return car;
  }
}


