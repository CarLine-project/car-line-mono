import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseCategory)
    private categoryRepository: Repository<ExpenseCategory>,
  ) {}

  async create(
    carId: string,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      carId,
    });
    return await this.expenseRepository.save(expense);
  }

  async findAll(
    carId: string,
    query: QueryExpenseDto,
  ): Promise<{ data: Expense[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, categoryId, from, to } = query;
    const skip = (page - 1) * limit;

    const where: any = { carId };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (from && to) {
      where.expenseDate = Between(new Date(from), new Date(to));
    } else if (from) {
      where.expenseDate = MoreThanOrEqual(new Date(from));
    } else if (to) {
      where.expenseDate = LessThanOrEqual(new Date(to));
    }

    const [data, total] = await this.expenseRepository.findAndCount({
      where,
      relations: ['category'],
      order: { expenseDate: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return expense;
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.findOne(id);
    Object.assign(expense, updateExpenseDto);
    return await this.expenseRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id);
    await this.expenseRepository.remove(expense);
  }

  async getCategories(): Promise<ExpenseCategory[]> {
    return await this.categoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async seedCategories(): Promise<void> {
    const categories = [
      { name: 'Паливо', icon: 'fuel' },
      { name: 'Ремонт', icon: 'construct' },
      { name: 'Страховка', icon: 'shield' },
      { name: 'ТО', icon: 'build' },
      { name: 'Мийка', icon: 'water' },
      { name: 'Парковка', icon: 'car' },
      { name: 'Інше', icon: 'ellipsis-horizontal' },
    ];

    for (const category of categories) {
      const existing = await this.categoryRepository.findOne({
        where: { name: category.name },
      });

      if (!existing) {
        const newCategory = this.categoryRepository.create(category);
        await this.categoryRepository.save(newCategory);
      }
    }
  }

  async getExpenseStats(
    carId: string,
    period?: { from: Date; to: Date },
  ): Promise<{
    totalAmount: number;
    byCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    byMonth: Array<{ month: string; amount: number }>;
  }> {
    const where: any = { carId };

    if (period) {
      where.expenseDate = Between(period.from, period.to);
    }

    const expenses = await this.expenseRepository.find({
      where,
      relations: ['category'],
    });

    const totalAmount = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );

    // Group by category
    const categoryMap = new Map<string, number>();
    expenses.forEach((expense) => {
      const categoryName = expense.category.name;
      const current = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, current + Number(expense.amount));
    });

    const byCategory = Array.from(categoryMap.entries()).map(
      ([category, amount]) => ({
        category,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      }),
    );

    // Group by month
    const monthMap = new Map<string, number>();
    expenses.forEach((expense) => {
      const date = new Date(expense.expenseDate);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthMap.get(month) || 0;
      monthMap.set(month, current + Number(expense.amount));
    });

    const byMonth = Array.from(monthMap.entries())
      .map(([month, amount]) => ({
        month,
        amount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalAmount,
      byCategory,
      byMonth,
    };
  }
}
