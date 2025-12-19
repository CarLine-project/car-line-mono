import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CarsService } from '../cars/cars.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly carsService: CarsService,
  ) {}

  @Post('cars/:carId/expenses')
  async create(
    @Param('carId') carId: string,
    @CurrentUser('id') userId: string,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    await this.carsService.verifyOwnership(carId, userId);
    return this.expensesService.create(carId, createExpenseDto);
  }

  @Get('cars/:carId/expenses')
  async findAll(
    @Param('carId') carId: string,
    @CurrentUser('id') userId: string,
    @Query() query: QueryExpenseDto,
  ) {
    await this.carsService.verifyOwnership(carId, userId);
    return this.expensesService.findAll(carId, query);
  }

  @Get('cars/:carId/expenses/stats')
  async getStats(
    @Param('carId') carId: string,
    @CurrentUser('id') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    await this.carsService.verifyOwnership(carId, userId);
    const period =
      from && to ? { from: new Date(from), to: new Date(to) } : undefined;
    return this.expensesService.getExpenseStats(carId, period);
  }

  @Get('expense-categories')
  getCategories() {
    return this.expensesService.getCategories();
  }

  @Get('expenses')
  async findAllForUser(
    @CurrentUser('id') userId: string,
    @Query() query: QueryExpenseDto & { carId?: string },
  ) {
    return this.expensesService.findAllForUser(userId, query);
  }

  @Get('expenses/stats')
  async getStatsForUser(
    @CurrentUser('id') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('carId') carId?: string,
  ) {
    const period =
      from && to ? { from: new Date(from), to: new Date(to) } : undefined;
    return this.expensesService.getExpenseStatsForUser(userId, period, carId);
  }

  @Get('expenses/:id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const expense = await this.expensesService.findOne(id);
    await this.carsService.verifyOwnership(expense.carId, userId);
    return expense;
  }

  @Patch('expenses/:id')
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    const expense = await this.expensesService.findOne(id);
    await this.carsService.verifyOwnership(expense.carId, userId);
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete('expenses/:id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const expense = await this.expensesService.findOne(id);
    await this.carsService.verifyOwnership(expense.carId, userId);
    return this.expensesService.remove(id);
  }
}
