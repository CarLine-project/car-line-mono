import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpensesService } from './expenses.service';
import { Expense } from './entities/expense.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { NotFoundException } from '@nestjs/common';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let expenseRepository: Repository<Expense>;
  let categoryRepository: Repository<ExpenseCategory>;

  const mockCategory: ExpenseCategory = {
    id: 'category-id-1',
    name: 'Паливо',
    icon: 'fuel',
    createdAt: new Date(),
    updatedAt: new Date(),
    expenses: [],
  };

  const mockExpense: Expense = {
    id: 'expense-id-1',
    carId: 'car-id-1',
    categoryId: 'category-id-1',
    amount: 500,
    expenseDate: new Date('2024-01-15'),
    description: 'Заправка',
    createdAt: new Date(),
    updatedAt: new Date(),
    car: null,
    category: mockCategory,
  };

  const mockExpenseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpenseRepository,
        },
        {
          provide: getRepositoryToken(ExpenseCategory),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    expenseRepository = module.get<Repository<Expense>>(
      getRepositoryToken(Expense),
    );
    categoryRepository = module.get<Repository<ExpenseCategory>>(
      getRepositoryToken(ExpenseCategory),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createExpenseDto: CreateExpenseDto = {
      categoryId: 'category-id-1',
      amount: 500,
      expenseDate: '2024-01-15',
      description: 'Заправка',
    };

    it('should create a new expense', async () => {
      mockExpenseRepository.create.mockReturnValue(mockExpense);
      mockExpenseRepository.save.mockResolvedValue(mockExpense);

      const result = await service.create('car-id-1', createExpenseDto);

      expect(result).toEqual(mockExpense);
      expect(mockExpenseRepository.create).toHaveBeenCalledWith({
        ...createExpenseDto,
        carId: 'car-id-1',
      });
      expect(mockExpenseRepository.save).toHaveBeenCalledWith(mockExpense);
    });
  });

  describe('findAll', () => {
    const query: QueryExpenseDto = {
      page: 1,
      limit: 20,
    };

    it('should return paginated expenses', async () => {
      const expenses = [mockExpense];
      mockExpenseRepository.findAndCount.mockResolvedValue([expenses, 1]);

      const result = await service.findAll('car-id-1', query);

      expect(result).toEqual({
        data: expenses,
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('should filter by category', async () => {
      const queryWithCategory: QueryExpenseDto = {
        ...query,
        categoryId: 'category-id-1',
      };
      mockExpenseRepository.findAndCount.mockResolvedValue([[mockExpense], 1]);

      const result = await service.findAll('car-id-1', queryWithCategory);

      expect(result.data).toHaveLength(1);
    });

    it('should filter by date range', async () => {
      const queryWithDates: QueryExpenseDto = {
        ...query,
        from: '2024-01-01',
        to: '2024-01-31',
      };
      mockExpenseRepository.findAndCount.mockResolvedValue([[mockExpense], 1]);

      const result = await service.findAll('car-id-1', queryWithDates);

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a single expense', async () => {
      mockExpenseRepository.findOne.mockResolvedValue(mockExpense);

      const result = await service.findOne('expense-id-1');

      expect(result).toEqual(mockExpense);
      expect(mockExpenseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'expense-id-1' },
        relations: ['category'],
      });
    });

    it('should throw NotFoundException if expense not found', async () => {
      mockExpenseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('expense-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateExpenseDto: UpdateExpenseDto = {
      amount: 600,
      description: 'Оновлений опис',
    };

    it('should update an expense', async () => {
      const updatedExpense = { ...mockExpense, ...updateExpenseDto };
      mockExpenseRepository.findOne.mockResolvedValue(mockExpense);
      mockExpenseRepository.save.mockResolvedValue(updatedExpense);

      const result = await service.update('expense-id-1', updateExpenseDto);

      expect(result).toEqual(updatedExpense);
      expect(mockExpenseRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if expense not found', async () => {
      mockExpenseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('expense-id-1', updateExpenseDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an expense', async () => {
      mockExpenseRepository.findOne.mockResolvedValue(mockExpense);
      mockExpenseRepository.remove.mockResolvedValue(mockExpense);

      await service.remove('expense-id-1');

      expect(mockExpenseRepository.remove).toHaveBeenCalledWith(mockExpense);
    });

    it('should throw NotFoundException if expense not found', async () => {
      mockExpenseRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('expense-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const categories = [mockCategory];
      mockCategoryRepository.find.mockResolvedValue(categories);

      const result = await service.getCategories();

      expect(result).toEqual(categories);
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
    });
  });

  describe('getExpenseStats', () => {
    it('should calculate expense statistics', async () => {
      const expense1 = { ...mockExpense, amount: 500 };
      const expense2 = {
        ...mockExpense,
        id: 'expense-id-2',
        amount: 700,
        category: { ...mockCategory, name: 'Ремонт' },
      };
      const expenses = [expense1, expense2];
      mockExpenseRepository.find.mockResolvedValue(expenses);

      const result = await service.getExpenseStats('car-id-1');

      expect(result.totalAmount).toBe(1200);
      expect(result.byCategory).toHaveLength(2);
      expect(result.byMonth).toBeDefined();
    });

    it('should filter stats by period', async () => {
      const period = {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      };
      const singleExpense = { ...mockExpense, amount: 600 };
      mockExpenseRepository.find.mockResolvedValue([singleExpense]);

      const result = await service.getExpenseStats('car-id-1', period);

      expect(result.totalAmount).toBe(600);
    });

    it('should return zero stats for no expenses', async () => {
      mockExpenseRepository.find.mockResolvedValue([]);

      const result = await service.getExpenseStats('car-id-1');

      expect(result.totalAmount).toBe(0);
      expect(result.byCategory).toHaveLength(0);
      expect(result.byMonth).toHaveLength(0);
    });
  });

  describe('findAllForUser', () => {
    it('should return expenses for user', async () => {
      const query: QueryExpenseDto & { carId?: string } = {
        page: 1,
        limit: 20,
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockExpense], 1]),
      };
      mockExpenseRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findAllForUser('user-id-1', query);

      expect(result).toEqual({
        data: [mockExpense],
        total: 1,
        page: 1,
        limit: 20,
      });
    });
  });

  describe('getExpenseStatsForUser', () => {
    it('should return stats for user', async () => {
      const expense = { ...mockExpense, amount: 600 };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([expense]),
      };
      mockExpenseRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getExpenseStatsForUser('user-id-1');

      expect(result.totalAmount).toBe(600);
      expect(result.byCategory).toBeDefined();
      expect(result.byMonth).toBeDefined();
    });
  });
});
