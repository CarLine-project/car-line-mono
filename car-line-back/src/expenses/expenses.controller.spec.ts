import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { CarsService } from '../cars/cars.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { Expense } from './entities/expense.entity';
import { ExpenseCategory } from './entities/expense-category.entity';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let expensesService: ExpensesService;
  let carsService: CarsService;

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

  const mockExpensesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getCategories: jest.fn(),
    getExpenseStats: jest.fn(),
    findAllForUser: jest.fn(),
    getExpenseStatsForUser: jest.fn(),
  };

  const mockCarsService = {
    verifyOwnership: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: mockExpensesService,
        },
        {
          provide: CarsService,
          useValue: mockCarsService,
        },
      ],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
    expensesService = module.get<ExpensesService>(ExpensesService);
    carsService = module.get<CarsService>(CarsService);
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
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockExpensesService.create.mockResolvedValue(mockExpense);

      const result = await controller.create(
        'car-id-1',
        'user-id-1',
        createExpenseDto,
      );

      expect(result).toEqual(mockExpense);
      expect(mockCarsService.verifyOwnership).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
      expect(mockExpensesService.create).toHaveBeenCalledWith(
        'car-id-1',
        createExpenseDto,
      );
    });
  });

  describe('findAll', () => {
    const query: QueryExpenseDto = {
      page: 1,
      limit: 20,
    };

    it('should return all expenses for a car', async () => {
      const paginatedResult = {
        data: [mockExpense],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockExpensesService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll('car-id-1', 'user-id-1', query);

      expect(result).toEqual(paginatedResult);
      expect(mockCarsService.verifyOwnership).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
      );
      expect(mockExpensesService.findAll).toHaveBeenCalledWith(
        'car-id-1',
        query,
      );
    });
  });

  describe('getStats', () => {
    it('should return expense statistics', async () => {
      const stats = {
        totalAmount: 5000,
        byCategory: [
          { category: 'Паливо', amount: 3000, percentage: 60 },
          { category: 'Ремонт', amount: 2000, percentage: 40 },
        ],
        byMonth: [{ month: '2024-01', amount: 5000 }],
      };
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockExpensesService.getExpenseStats.mockResolvedValue(stats);

      const result = await controller.getStats(
        'car-id-1',
        'user-id-1',
        '2024-01-01',
        '2024-01-31',
      );

      expect(result).toEqual(stats);
      expect(mockExpensesService.getExpenseStats).toHaveBeenCalledWith(
        'car-id-1',
        {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31'),
        },
      );
    });

    it('should return stats without period', async () => {
      const stats = {
        totalAmount: 5000,
        byCategory: [],
        byMonth: [],
      };
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockExpensesService.getExpenseStats.mockResolvedValue(stats);

      const result = await controller.getStats('car-id-1', 'user-id-1');

      expect(result).toEqual(stats);
      expect(mockExpensesService.getExpenseStats).toHaveBeenCalledWith(
        'car-id-1',
        undefined,
      );
    });
  });

  describe('getCategories', () => {
    it('should return all expense categories', async () => {
      const categories = [mockCategory];
      mockExpensesService.getCategories.mockResolvedValue(categories);

      const result = await controller.getCategories();

      expect(result).toEqual(categories);
      expect(mockExpensesService.getCategories).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single expense', async () => {
      mockExpensesService.findOne.mockResolvedValue(mockExpense);
      mockCarsService.verifyOwnership.mockResolvedValue({});

      const result = await controller.findOne('expense-id-1', 'user-id-1');

      expect(result).toEqual(mockExpense);
      expect(mockExpensesService.findOne).toHaveBeenCalledWith('expense-id-1');
      expect(mockCarsService.verifyOwnership).toHaveBeenCalledWith(
        'car-id-1',
        'user-id-1',
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
      mockExpensesService.findOne.mockResolvedValue(mockExpense);
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockExpensesService.update.mockResolvedValue(updatedExpense);

      const result = await controller.update(
        'expense-id-1',
        'user-id-1',
        updateExpenseDto,
      );

      expect(result).toEqual(updatedExpense);
      expect(mockExpensesService.update).toHaveBeenCalledWith(
        'expense-id-1',
        updateExpenseDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove an expense', async () => {
      mockExpensesService.findOne.mockResolvedValue(mockExpense);
      mockCarsService.verifyOwnership.mockResolvedValue({});
      mockExpensesService.remove.mockResolvedValue(undefined);

      await controller.remove('expense-id-1', 'user-id-1');

      expect(mockExpensesService.remove).toHaveBeenCalledWith('expense-id-1');
    });
  });

  describe('findAllForUser', () => {
    const query: QueryExpenseDto & { carId?: string } = {
      page: 1,
      limit: 20,
      carId: 'car-id-1',
    };

    it('should return all expenses for a user', async () => {
      const paginatedResult = {
        data: [mockExpense],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockExpensesService.findAllForUser.mockResolvedValue(paginatedResult);

      const result = await controller.findAllForUser('user-id-1', query);

      expect(result).toEqual(paginatedResult);
      expect(mockExpensesService.findAllForUser).toHaveBeenCalledWith(
        'user-id-1',
        query,
      );
    });
  });

  describe('getStatsForUser', () => {
    it('should return expense statistics for user', async () => {
      const stats = {
        totalAmount: 5000,
        byCategory: [],
        byMonth: [],
      };
      mockExpensesService.getExpenseStatsForUser.mockResolvedValue(stats);

      const result = await controller.getStatsForUser(
        'user-id-1',
        '2024-01-01',
        '2024-01-31',
        'car-id-1',
      );

      expect(result).toEqual(stats);
      expect(mockExpensesService.getExpenseStatsForUser).toHaveBeenCalledWith(
        'user-id-1',
        {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31'),
        },
        'car-id-1',
      );
    });
  });
});
