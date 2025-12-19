import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [ExpensesModule],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}
