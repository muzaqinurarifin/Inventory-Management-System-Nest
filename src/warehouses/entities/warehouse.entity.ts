import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StockMovement } from '../../stock-movements/entities/stock-movement.entity.js';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  code: string; // Contoh: WH-JKT-01

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  location: string;

  @Column({ type: 'int', default: 1000 })
  capacity: number;

  @OneToMany(() => StockMovement, (movement) => movement.warehouse)
  stockMovements: StockMovement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
