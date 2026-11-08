import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  type Relation,
} from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity.js';
import { StockMovementItem } from '../../stock-movement-items/entities/stock-movement-item.entity.js';

export enum MovementType {
  IN = 'IN', // barang masuk (menambah stok)
  OUT = 'OUT', // barang keluar (mengurangi stok)
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  referenceNumber: string; // contoh: trx-in-2026001

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Column({ type: 'date' })
  movementDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.stockMovements, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Relation<Warehouse>;

  @OneToMany(() => StockMovementItem, (item) => item.stockMovement, {
    cascade: ['soft-remove'],
  })
  items: Relation<StockMovementItem[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
