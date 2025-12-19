import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MileageService } from './mileage.service';
import { Mileage } from './entities/mileage.entity';
import { CreateMileageDto } from './dto/create-mileage.dto';
import { UpdateMileageDto } from './dto/update-mileage.dto';
import { QueryMileageDto } from './dto/query-mileage.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MileageService', () => {
  let service: MileageService;
  let repository: Repository<Mileage>;

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

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MileageService,
        {
          provide: getRepositoryToken(Mileage),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MileageService>(MileageService);
    repository = module.get<Repository<Mileage>>(getRepositoryToken(Mileage));
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
      mockRepository.findOne.mockResolvedValue(null); // No previous mileage
      mockRepository.create.mockReturnValue(mockMileage);
      mockRepository.save.mockResolvedValue(mockMileage);

      const result = await service.create('car-id-1', createMileageDto);

      expect(result).toEqual(mockMileage);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createMileageDto,
        carId: 'car-id-1',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockMileage);
    });

    it('should throw BadRequestException if new mileage is not greater', async () => {
      const lastMileage = { ...mockMileage, value: 110000 };
      mockRepository.findOne.mockResolvedValue(lastMileage);

      const newMileageDto: CreateMileageDto = {
        value: 100000,
        recordedAt: '2024-01-15',
      };

      await expect(service.create('car-id-1', newMileageDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow mileage if it is greater than last', async () => {
      const lastMileage = { ...mockMileage, value: 90000 };
      mockRepository.findOne.mockResolvedValue(lastMileage);
      const newMileage = { ...mockMileage, value: 100000 };
      mockRepository.create.mockReturnValue(newMileage);
      mockRepository.save.mockResolvedValue(newMileage);

      const newMileageDto: CreateMileageDto = {
        value: 100000,
        recordedAt: '2024-01-15',
      };

      const result = await service.create('car-id-1', newMileageDto);

      expect(result.value).toBe(100000);
    });
  });

  describe('findAll', () => {
    const query: QueryMileageDto = {
      page: 1,
      limit: 20,
    };

    it('should return paginated mileage records', async () => {
      const mileageRecords = [mockMileage];
      mockRepository.findAndCount.mockResolvedValue([mileageRecords, 1]);

      const result = await service.findAll('car-id-1', query);

      expect(result).toEqual({
        data: mileageRecords,
        total: 1,
        page: 1,
        limit: 20,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { carId: 'car-id-1' },
        order: { recordedAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should handle pagination correctly', async () => {
      const query: QueryMileageDto = {
        page: 2,
        limit: 10,
      };
      mockRepository.findAndCount.mockResolvedValue([[mockMileage], 1]);

      const result = await service.findAll('car-id-1', query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { carId: 'car-id-1' },
        order: { recordedAt: 'DESC' },
        skip: 10,
        take: 10,
      });
    });
  });

  describe('getCurrentMileage', () => {
    it('should return the latest mileage record', async () => {
      mockRepository.findOne.mockResolvedValue(mockMileage);

      const result = await service.getCurrentMileage('car-id-1');

      expect(result).toEqual(mockMileage);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { carId: 'car-id-1' },
        order: { recordedAt: 'DESC', createdAt: 'DESC' },
      });
    });

    it('should return null if no mileage records', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getCurrentMileage('car-id-1');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a single mileage record', async () => {
      mockRepository.findOne.mockResolvedValue(mockMileage);

      const result = await service.findOne('mileage-id-1');

      expect(result).toEqual(mockMileage);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'mileage-id-1' },
      });
    });

    it('should throw NotFoundException if mileage not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('mileage-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateMileageDto: UpdateMileageDto = {
      comment: 'Оновлений коментар',
    };

    it('should update a mileage record', async () => {
      const updatedMileage = { ...mockMileage, ...updateMileageDto };
      mockRepository.findOne.mockResolvedValue(mockMileage);
      mockRepository.save.mockResolvedValue(updatedMileage);

      const result = await service.update('mileage-id-1', updateMileageDto);

      expect(result).toEqual(updatedMileage);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if mileage not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('mileage-id-1', updateMileageDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a mileage record', async () => {
      mockRepository.findOne.mockResolvedValue(mockMileage);
      mockRepository.remove.mockResolvedValue(mockMileage);

      await service.remove('mileage-id-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockMileage);
    });

    it('should throw NotFoundException if mileage not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('mileage-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
