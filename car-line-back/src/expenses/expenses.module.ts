import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from './entities/expense.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { CarsModule } from '../cars/cars.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, ExpenseCategory]),
    CarsModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
