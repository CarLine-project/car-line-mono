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

@Entity('mileages')
export class Mileage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  carId: string;

  @ManyToOne(() => Car, (car) => car.mileages)
  @JoinColumn({ name: 'carId' })
  car: Car;

  @Column({ type: 'int' })
  value: number;

  @Column({ type: 'date' })
  recordedAt: Date;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


