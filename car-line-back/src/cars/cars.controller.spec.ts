import { Test, TestingModule } from '@nestjs/testing';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car } from './entities/car.entity';

describe('CarsController', () => {
  let controller: CarsController;
  let service: CarsService;

  const mockCar: Car = {
    id: 'car-id-1',
    userId: 'user-id-1',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    licensePlate: 'ABC123',
    vin: '1HGBH41JXMN109186',
    color: 'Blue',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    expenses: [],
    maintenance: [],
    mileage: [],
  };

  const mockCarsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    activate: jest.fn(),
    getActiveCar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [
        {
          provide: CarsService,
          useValue: mockCarsService,
        },
      ],
    }).compile();

    controller = module.get<CarsController>(CarsController);
    service = module.get<CarsService>(CarsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCarDto: CreateCarDto = {
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      licensePlate: 'XYZ789',
      vin: '2HGFC2F59FH123456',
      color: 'Red',
    };

    it('should create a new car', async () => {
      const newCar = { ...mockCar, ...createCarDto };
      mockCarsService.create.mockResolvedValue(newCar);

      const result = await controller.create('user-id-1', createCarDto);

      expect(result).toEqual(newCar);
      expect(mockCarsService.create).toHaveBeenCalledWith(
        'user-id-1',
        createCarDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all cars for a user', async () => {
      const cars = [mockCar, { ...mockCar, id: 'car-id-2' }];
      mockCarsService.findAll.mockResolvedValue(cars);

      const result = await controller.findAll('user-id-1');

      expect(result).toEqual(cars);
      expect(mockCarsService.findAll).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('getActiveCar', () => {
    it('should return active car for user', async () => {
      mockCarsService.getActiveCar.mockResolvedValue(mockCar);

      const result = await controller.getActiveCar('user-id-1');

      expect(result).toEqual(mockCar);
      expect(mockCarsService.getActiveCar).toHaveBeenCalledWith('user-id-1');
    });

    it('should return null if no active car', async () => {
      mockCarsService.getActiveCar.mockResolvedValue(null);

      const result = await controller.getActiveCar('user-id-1');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a single car', async () => {
      mockCarsService.findOne.mockResolvedValue(mockCar);

      const result = await controller.findOne('car-id-1', 'user-id-1');

      expect(result).toEqual(mockCar);
      expect(mockCarsService.findOne).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
    });
  });

  describe('update', () => {
    const updateCarDto: UpdateCarDto = {
      color: 'Green',
      licensePlate: 'NEW123',
    };

    it('should update a car', async () => {
      const updatedCar = { ...mockCar, ...updateCarDto };
      mockCarsService.update.mockResolvedValue(updatedCar);

      const result = await controller.update(
        'car-id-1',
        'user-id-1',
        updateCarDto,
      );

      expect(result).toEqual(updatedCar);
      expect(mockCarsService.update).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
        updateCarDto,
      );
    });
  });

  describe('activate', () => {
    it('should activate a car', async () => {
      const activatedCar = { ...mockCar, isActive: true };
      mockCarsService.activate.mockResolvedValue(activatedCar);

      const result = await controller.activate('car-id-1', 'user-id-1');

      expect(result).toEqual(activatedCar);
      expect(mockCarsService.activate).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
    });
  });

  describe('remove', () => {
    it('should remove a car', async () => {
      mockCarsService.remove.mockResolvedValue(undefined);

      await controller.remove('car-id-1', 'user-id-1');

      expect(mockCarsService.remove).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
    });
  });
});
