import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarsService } from './cars.service';
import { Car } from './entities/car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CarsService', () => {
  let service: CarsService;
  let repository: Repository<Car>;

  const mockCar: Car = {
    id: 'car-id-1',
    userId: 'user-id-1',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    initialMileage: 50000,
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: null,
    mileages: [],
    expenses: [],
    maintenances: [],
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        {
          provide: getRepositoryToken(Car),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);
    repository = module.get<Repository<Car>>(getRepositoryToken(Car));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCarDto: CreateCarDto = {
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      initialMileage: 10000,
    };

    it('should create a new car', async () => {
      const newCar = { ...mockCar, ...createCarDto };
      mockRepository.create.mockReturnValue(newCar);
      mockRepository.save.mockResolvedValue(newCar);

      const result = await service.create('user-id-1', createCarDto);

      expect(result).toEqual(newCar);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createCarDto,
        userId: 'user-id-1',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(newCar);
    });
  });

  describe('findAll', () => {
    it('should return all cars for a user', async () => {
      const cars = [mockCar, { ...mockCar, id: 'car-id-2' }];
      mockRepository.find.mockResolvedValue(cars);

      const result = await service.findAll('user-id-1');

      expect(result).toEqual(cars);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array if user has no cars', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll('user-id-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single car', async () => {
      mockRepository.findOne.mockResolvedValue(mockCar);

      const result = await service.findOne('car-id-1', 'user-id-1');

      expect(result).toEqual(mockCar);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'car-id-1', userId: 'user-id-1' },
      });
    });

    it('should throw NotFoundException if car not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('car-id-1', 'user-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateCarDto: UpdateCarDto = {
      make: 'Honda',
      model: 'Accord',
    };

    it('should update a car', async () => {
      const updatedCar = { ...mockCar, ...updateCarDto };
      mockRepository.findOne.mockResolvedValue(mockCar);
      mockRepository.save.mockResolvedValue(updatedCar);

      const result = await service.update(
        'car-id-1',
        'user-id-1',
        updateCarDto,
      );

      expect(result).toEqual(updatedCar);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if car not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('car-id-1', 'user-id-1', updateCarDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a car', async () => {
      mockRepository.findOne.mockResolvedValue(mockCar);
      mockRepository.remove.mockResolvedValue(mockCar);

      await service.remove('car-id-1', 'user-id-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockCar);
    });

    it('should throw NotFoundException if car not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('car-id-1', 'user-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activate', () => {
    it('should activate a car and deactivate all others', async () => {
      const activatedCar = { ...mockCar, isActive: true };
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockCar);
      mockRepository.save.mockResolvedValue(activatedCar);

      const result = await service.activate('car-id-1', 'user-id-1');

      expect(result.isActive).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { userId: 'user-id-1' },
        { isActive: false },
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if car not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.activate('car-id-1', 'user-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getActiveCar', () => {
    it('should return the active car', async () => {
      const activeCar = { ...mockCar, isActive: true };
      mockRepository.findOne.mockResolvedValue(activeCar);

      const result = await service.getActiveCar('user-id-1');

      expect(result).toEqual(activeCar);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-id-1', isActive: true },
      });
    });

    it('should return null if no active car', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getActiveCar('user-id-1');

      expect(result).toBeNull();
    });
  });

  describe('verifyOwnership', () => {
    it('should return car if user owns it', async () => {
      mockRepository.findOne.mockResolvedValue(mockCar);

      const result = await service.verifyOwnership('car-id-1', 'user-id-1');

      expect(result).toEqual(mockCar);
    });

    it('should throw NotFoundException if car not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.verifyOwnership('car-id-1', 'user-id-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own car', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockCar,
        userId: 'other-user-id',
      });

      await expect(
        service.verifyOwnership('car-id-1', 'user-id-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
