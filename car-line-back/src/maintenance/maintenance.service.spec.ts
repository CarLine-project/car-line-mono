import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceService } from './maintenance.service';
import { Maintenance } from './entities/maintenance.entity';
import { MileageService } from '../mileage/mileage.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { QueryMaintenanceDto } from './dto/query-maintenance.dto';
import { NotFoundException } from '@nestjs/common';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let repository: Repository<Maintenance>;
  let mileageService: MileageService;

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

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockMileageService = {
    getCurrentMileage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        {
          provide: getRepositoryToken(Maintenance),
          useValue: mockRepository,
        },
        {
          provide: MileageService,
          useValue: mockMileageService,
        },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
    repository = module.get<Repository<Maintenance>>(
      getRepositoryToken(Maintenance),
    );
    mileageService = module.get<MileageService>(MileageService);
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
      mockRepository.create.mockReturnValue(mockMaintenance);
      mockRepository.save.mockResolvedValue(mockMaintenance);

      const result = await service.create('car-id-1', createMaintenanceDto);

      expect(result).toEqual(mockMaintenance);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createMaintenanceDto,
        carId: 'car-id-1',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockMaintenance);
    });
  });

  describe('findAll', () => {
    const query: QueryMaintenanceDto = {
      page: 1,
      limit: 20,
    };

    it('should return paginated maintenance records', async () => {
      const maintenanceRecords = [mockMaintenance];
      mockRepository.findAndCount.mockResolvedValue([maintenanceRecords, 1]);

      const result = await service.findAll('car-id-1', query);

      expect(result).toEqual({
        data: maintenanceRecords,
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('should filter by date range', async () => {
      const queryWithDates: QueryMaintenanceDto = {
        ...query,
        from: '2024-01-01',
        to: '2024-01-31',
      };
      mockRepository.findAndCount.mockResolvedValue([[mockMaintenance], 1]);

      const result = await service.findAll('car-id-1', queryWithDates);

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a single maintenance record', async () => {
      mockRepository.findOne.mockResolvedValue(mockMaintenance);

      const result = await service.findOne('maintenance-id-1');

      expect(result).toEqual(mockMaintenance);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'maintenance-id-1' },
      });
    });

    it('should throw NotFoundException if maintenance not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('maintenance-id-1')).rejects.toThrow(
        NotFoundException,
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
      mockRepository.findOne.mockResolvedValue(mockMaintenance);
      mockRepository.save.mockResolvedValue(updatedMaintenance);

      const result = await service.update(
        'maintenance-id-1',
        updateMaintenanceDto,
      );

      expect(result).toEqual(updatedMaintenance);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if maintenance not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('maintenance-id-1', updateMaintenanceDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a maintenance record', async () => {
      mockRepository.findOne.mockResolvedValue(mockMaintenance);
      mockRepository.remove.mockResolvedValue(mockMaintenance);

      await service.remove('maintenance-id-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockMaintenance);
    });

    it('should throw NotFoundException if maintenance not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('maintenance-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getNextMaintenanceRecommendation', () => {
    it('should recommend maintenance when no previous records', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockMileageService.getCurrentMileage.mockResolvedValue({ value: 100000 });

      const result = await service.getNextMaintenanceRecommendation('car-id-1');

      expect(result.recommended).toBe(true);
      expect(result.reason).toContain('Немає записів');
      expect(result.suggestedMileage).toBe(110000);
    });

    it('should recommend maintenance based on mileage', async () => {
      const lastMaintenance = {
        ...mockMaintenance,
        mileageAtService: 90000,
      };
      mockRepository.findOne.mockResolvedValue(lastMaintenance);
      mockMileageService.getCurrentMileage.mockResolvedValue({
        value: 110000,
      });

      const result = await service.getNextMaintenanceRecommendation('car-id-1');

      expect(result.recommended).toBe(true);
      expect(result.reason).toContain('Пробіг з останнього ТО: 20000');
    });

    it('should recommend maintenance based on time', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 200);
      const lastMaintenance = {
        ...mockMaintenance,
        serviceDate: oldDate,
        mileageAtService: 90000,
      };
      mockRepository.findOne.mockResolvedValue(lastMaintenance);
      mockMileageService.getCurrentMileage.mockResolvedValue({ value: 92000 });

      const result = await service.getNextMaintenanceRecommendation('car-id-1');

      expect(result.recommended).toBe(true);
      expect(result.reason).toContain('днів з останнього ТО');
    });

    it('should not recommend maintenance if recent', async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);
      const lastMaintenance = {
        ...mockMaintenance,
        serviceDate: recentDate,
        mileageAtService: 100000,
      };
      mockRepository.findOne.mockResolvedValue(lastMaintenance);
      mockMileageService.getCurrentMileage.mockResolvedValue({
        value: 103000,
      });

      const result = await service.getNextMaintenanceRecommendation('car-id-1');

      expect(result.recommended).toBe(false);
      expect(result.reason).toContain('Наступне ТО через');
    });
  });

  describe('findAllForUser', () => {
    it('should return maintenance records for user', async () => {
      const query: QueryMaintenanceDto & { carId?: string } = {
        page: 1,
        limit: 20,
      };
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockMaintenance], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAllForUser('user-id-1', query);

      expect(result).toEqual({
        data: [mockMaintenance],
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('should filter by carId when provided', async () => {
      const query: QueryMaintenanceDto & { carId?: string } = {
        page: 1,
        limit: 20,
        carId: 'car-id-1',
      };
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockMaintenance], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAllForUser('user-id-1', query);

      expect(result.data).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });
});
