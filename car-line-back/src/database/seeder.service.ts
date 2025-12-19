import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ExpensesService } from '../expenses/expenses.service';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly expensesService: ExpensesService) {}

  async onModuleInit() {
    await this.seedAll();
  }

  async seedAll() {
    try {
      this.logger.log('Starting database seeding...');
      await this.seedExpenseCategories();
      this.logger.log('Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Error during database seeding:', error);
    }
  }

  async seedExpenseCategories() {
    this.logger.log('Seeding expense categories...');
    await this.expensesService.seedCategories();
    this.logger.log('Expense categories seeded successfully!');
  }
}
