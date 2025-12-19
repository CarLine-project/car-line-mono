import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Mileage } from '../../mileage/entities/mileage.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { Maintenance } from '../../maintenance/entities/maintenance.entity';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar' })
  make: string;

  @Column({ type: 'varchar' })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  initialMileage: number;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @OneToMany(() => Mileage, (mileage) => mileage.car)
  mileages: Mileage[];

  @OneToMany(() => Expense, (expense) => expense.car)
  expenses: Expense[];

  @OneToMany(() => Maintenance, (maintenance) => maintenance.car)
  maintenances: Maintenance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


