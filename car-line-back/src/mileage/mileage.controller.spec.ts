import { Test, TestingModule } from '@nestjs/testing';
import { MileageController } from './mileage.controller';
import { MileageService } from './mileage.service';
import { CarsService } from '../cars/cars.service';
import { CreateMileageDto } from './dto/create-mileage.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';
import { QueryMileageDto } from './dto/query-mileage.dto';
import { Mileage } from './entities/mileage.entity';

describe('MileageController', () => {
  let controller: MileageController;
  let mileageService: MileageService;
  let carsService: CarsService;

  const mockMileage: Mileage = {
    id: 'mileage-id-1',
    carId: 'car-id-1',
    value: 100000,
    recordedAt: new Date('2024-01-15'),
    comment: 'Запис пробігу',
    createdAt: new Date(),
    updatedAt: new Date(),
    car: null,
  };

  const mockMileageService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getCurrentMileage: jest.fn(),
  };

  const mockCarsService = {
    verifyOwnership: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MileageController],
      providers: [
        {
          provide: MileageService,
          useValue: mockMileageService,
        },
        {
          provide: CarsService,
          useValue: mockCarsService,
        },
      ],
    }).compile();

    controller = module.get<MileageController>(MileageController);
    mileageService = module.get<MileageService>(MileageService);
    carsService = module.get<CarsService>(CarsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createMileageDto: CreateMileageDto = {
      value: 100000,
      recordedAt: '2024-01-15',
      comment: 'Запис пробігу',
    };

    it('should create a new mileage record', async () => {
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockMileageService.create.mockResolvedValue(mockMileage);

      const result = await controller.create(
        'car-id-1',
        'user-id-1',
        createMileageDto,
      );

      expect(result).toEqual(mockMileage);
      expect(mockCarsService.verifyOwnership).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
      expect(mockMileageService.create).toHaveBeenCalledWith(
        'car-id-1',
        createMileageDto,
      );
    });
  });

  describe('findAll', () => {
    const query: QueryMileageDto = {
      page: 1,
      limit: 20,
    };

    it('should return all mileage records for a car', async () => {
      const paginatedResult = {
        data: [mockMileage],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockMileageService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll('car-id-1', 'user-id-1', query);

      expect(result).toEqual(paginatedResult);
      expect(mockCarsService.verifyOwnership).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
      expect(mockMileageService.findAll).toHaveBeenCalledWith(
        'car-id-1',
        query,
      );
    });
  });

  describe('getCurrentMileage', () => {
    it('should return current mileage for a car', async () => {
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockMileageService.getCurrentMileage.mockResolvedValue(mockMileage);

      const result = await controller.getCurrentMileage(
        'car-id-1',
        'user-id-1',
      );

      expect(result).toEqual(mockMileage);
      expect(mockCarsService.verifyOwnership).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
      expect(mockMileageService.getCurrentMileage).toHaveBeenCalledWith(
        'car-id-1',
      );
    });

    it('should return null if no mileage records', async () => {
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockMileageService.getCurrentMileage.mockResolvedValue(null);

      const result = await controller.getCurrentMileage(
        'car-id-1',
        'user-id-1',
      );

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a single mileage record', async () => {
      mockMileageService.findOne.mockResolvedValue(mockMileage);
      mockCarsService.verifyOwnership.mockResolvedValue({});

      const result = await controller.findOne('mileage-id-1', 'user-id-1');

      expect(result).toEqual(mockMileage);
      expect(mockMileageService.findOne).toHaveBeenCalledWith('mileage-id-1');
      expect(mockCarsService.verifyOwnership).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
    });
  });

  describe('update', () => {
    const updateMileageDto: UpdateMileageDto = {
      comment: 'Оновлений коментар',
    };

    it('should update a mileage record', async () => {
      const updatedMileage = { ...mockMileage, ...updateMileageDto };
      mockMileageService.findOne.mockResolvedValue(mockMileage);
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockMileageService.update.mockResolvedValue(updatedMileage);

      const result = await controller.update(
        'mileage-id-1',
        'user-id-1',
        updateMileageDto,
      );

      expect(result).toEqual(updatedMileage);
      expect(mockMileageService.update).toHaveBeenCalledWith(
        'mileage-id-1',
        updateMileageDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a mileage record', async () => {
      mockMileageService.findOne.mockResolvedValue(mockMileage);
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockMileageService.remove.mockResolvedValue(undefined);

      await controller.remove('mileage-id-1', 'user-id-1');

      expect(mockMileageService.remove).toHaveBeenCalledWith('mileage-id-1');
    });
  });
});
