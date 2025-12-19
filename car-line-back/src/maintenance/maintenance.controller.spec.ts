import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { CarsService } from '../cars/cars.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';
import { Maintenance } from './entities/maintenance.entity';

describe('MaintenanceController', () => {
  let controller: MaintenanceController;
  let maintenanceService: MaintenanceService;
  let carsService: CarsService;

  const mockMaintenance: Maintenance = {
    id: 'maintenance-id-1',
    carId: 'car-id-1',
    serviceType: 'Заміна масла',
    mileageAtService: 100000,
    serviceDate: new Date('2024-01-15'),
    cost: 1500,
    description: 'Планове ТО',
    createdAt: new Date(),
    updatedAt: new Date(),
    car: null,
  };

  const mockMaintenanceService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getNextMaintenanceRecommendation: jest.fn(),
    findAllForUser: jest.fn(),
  };

  const mockCarsService = {
    verifyOwnership: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceController],
      providers: [
        {
          provide: MaintenanceService,
          useValue: mockMaintenanceService,
        },
        {
          provide: CarsService,
          useValue: mockCarsService,
        },
      ],
    }).compile();

    controller = module.get<MaintenanceController>(MaintenanceController);
    maintenanceService = module.get<MaintenanceService>(MaintenanceService);
    carsService = module.get<CarsService>(CarsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createMaintenanceDto: CreateMaintenanceDto = {
      serviceType: 'Заміна масла',
      mileageAtService: 100000,
      serviceDate: '2024-01-15',
      cost: 1500,
      description: 'Планове ТО',
    };

    it('should create a new maintenance record', async () => {
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockMaintenanceService.create.mockResolvedValue(mockMaintenance);

      const result = await controller.create(
        'car-id-1',
        'user-id-1',
        createMaintenanceDto,
      );

      expect(result).toEqual(mockMaintenance);
      expect(mockCarsService.verifyOwnership).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
      expect(mockMaintenanceService.create).toHaveBeenCalledWith(
        'car-id-1',
        createMaintenanceDto,
      );
    });
  });

  describe('findAll', () => {
    const query: QueryMaintenanceDto = {
      page: 1,
      limit: 20,
    };

    it('should return all maintenance records for a car', async () => {
      const paginatedResult = {
        data: [mockMaintenance],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockMaintenanceService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll('car-id-1', 'user-id-1', query);

      expect(result).toEqual(paginatedResult);
      expect(mockCarsService.verifyOwnership).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
      expect(mockMaintenanceService.findAll).toHaveBeenCalledWith(
        'car-id-1',
        query,
      );
    });
  });

  describe('getNextRecommendation', () => {
    it('should return next maintenance recommendation', async () => {
      const recommendation = {
        recommended: true,
        reason: 'Пробіг з останнього ТО: 12000 км',
        suggestedMileage: 110000,
        suggestedDate: new Date(),
      };
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockMaintenanceService.getNextMaintenanceRecommendation.mockResolvedValue(
        recommendation,
      );

      const result = await controller.getNextRecommendation(
        'car-id-1',
        'user-id-1',
      );

      expect(result).toEqual(recommendation);
      expect(
        mockMaintenanceService.getNextMaintenanceRecommendation,
      ).toHaveBeenCalledWith('car-id-1');
    });
  });

  describe('findOne', () => {
    it('should return a single maintenance record', async () => {
      mockMaintenanceService.findOne.mockResolvedValue(mockMaintenance);
      mockCarsService.verifyOwnership.mockResolvedValue({});

      const result = await controller.findOne('maintenance-id-1', 'user-id-1');

      expect(result).toEqual(mockMaintenance);
      expect(mockMaintenanceService.findOne).toHaveBeenCalledWith(
        'maintenance-id-1',
      );
      expect(mockCarsService.verifyOwnership).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
    });
  });

  describe('update', () => {
    const updateMaintenanceDto: UpdateMaintenanceDto = {
      cost: 1600,
      description: 'Оновлений опис',
    };

    it('should update a maintenance record', async () => {
      const updatedMaintenance = {
        ...mockMaintenance,
        ...updateMaintenanceDto,
      };
      mockMaintenanceService.findOne.mockResolvedValue(mockMaintenance);
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockMaintenanceService.update.mockResolvedValue(updatedMaintenance);

      const result = await controller.update(
        'maintenance-id-1',
        'user-id-1',
        updateMaintenanceDto,
      );

      expect(result).toEqual(updatedMaintenance);
      expect(mockMaintenanceService.update).toHaveBeenCalledWith(
        'maintenance-id-1',
        updateMaintenanceDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a maintenance record', async () => {
      mockMaintenanceService.findOne.mockResolvedValue(mockMaintenance);
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockMaintenanceService.remove.mockResolvedValue(undefined);

      await controller.remove('maintenance-id-1', 'user-id-1');

      expect(mockMaintenanceService.remove).toHaveBeenCalledWith(
        'maintenance-id-1',
      );
    });
  });

  describe('findAllForUser', () => {
    const query: QueryMaintenanceDto & { carId?: string } = {
      page: 1,
      limit: 20,
      carId: 'car-id-1',
    };

    it('should return all maintenance records for a user', async () => {
      const paginatedResult = {
        data: [mockMaintenance],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockMaintenanceService.findAllForUser.mockResolvedValue(paginatedResult);

      const result = await controller.findAllForUser('user-id-1', query);

      expect(result).toEqual(paginatedResult);
      expect(mockMaintenanceService.findAllForUser).toHaveBeenCalledWith(
        'user-id-1',
        query,
      );
    });
  });
});
