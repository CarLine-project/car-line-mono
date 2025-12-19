import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Expense } from './expense.entity';

@Entity('expense_categories')
export class ExpenseCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar' })
  icon: string;

  @OneToMany(() => Expense, (expense) => expense.category)
  expenses: Expense[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


