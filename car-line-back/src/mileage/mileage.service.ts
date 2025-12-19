import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mileage } from './entities/mileage.entity';
import { CreateMileageDto } from './dto/create-mileage.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';
import { QueryMileageDto } from './dto/query-mileage.dto';

@Injectable()
export class MileageService {
  constructor(
    @InjectRepository(Mileage)
    private mileageRepository: Repository<Mileage>,
  ) {}

  async create(
    carId: string,
    createMileageDto: CreateMileageDto,
  ): Promise<Mileage> {
    // Validate that new mileage is greater than the last one
    const lastMileage = await this.getLastMileage(carId);
    if (lastMileage && createMileageDto.value <= lastMileage.value) {
      throw new BadRequestException(
        `New mileage (${createMileageDto.value}) must be greater than last recorded mileage (${lastMileage.value})`,
      );
    }

    const mileage = this.mileageRepository.create({
      ...createMileageDto,
      carId,
    });
    return await this.mileageRepository.save(mileage);
  }

  async findAll(
    carId: string,
    query: QueryMileageDto,
  ): Promise<{ data: Mileage[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.mileageRepository.findAndCount({
      where: { carId },
      order: { recordedAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getCurrentMileage(carId: string): Promise<Mileage | null> {
    return await this.getLastMileage(carId);
  }

  async findOne(id: string): Promise<Mileage> {
    const mileage = await this.mileageRepository.findOne({ where: { id } });
    if (!mileage) {
      throw new NotFoundException(`Mileage record with ID ${id} not found`);
    }
    return mileage;
  }

  async update(
    id: string,
    updateMileageDto: UpdateMileageDto,
  ): Promise<Mileage> {
    const mileage = await this.findOne(id);
    Object.assign(mileage, updateMileageDto);
    return await this.mileageRepository.save(mileage);
  }

  async remove(id: string): Promise<void> {
    const mileage = await this.findOne(id);
    await this.mileageRepository.remove(mileage);
  }

  private async getLastMileage(carId: string): Promise<Mileage | null> {
    return await this.mileageRepository.findOne({
      where: { carId },
      order: { recordedAt: 'DESC', createdAt: 'DESC' },
    });
  }
}


