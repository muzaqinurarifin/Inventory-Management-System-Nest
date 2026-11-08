import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  type Relation,
} from 'typeorm';
import { StockMovement } from '../../stock-movements/entities/stock-movement.entity.js';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 30 })
  code: string; // contoh: wh-jkt-01

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  location: string;

  @Column({ type: 'int', default: 1000 })
  capacity: number;

  @OneToMany(() => StockMovement, (movement) => movement.warehouse)
  stockMovements: Relation<StockMovement[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
