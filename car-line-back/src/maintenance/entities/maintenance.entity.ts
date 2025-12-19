import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Car } from '../../cars/entities/car.entity';

@Entity('maintenances')
export class Maintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  carId: string;

  @ManyToOne(() => Car, (car) => car.maintenances)
  @JoinColumn({ name: 'carId' })
  car: Car;

  @Column({ type: 'varchar' })
  serviceType: string;

  @Column({ type: 'int' })
  mileageAtService: number;

  @Column({ type: 'date' })
  serviceDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


