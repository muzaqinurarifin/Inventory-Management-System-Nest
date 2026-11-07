import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity.js';
import { StockMovementItem } from '../../stock-movement-items/entities/stock-movement-item.entity.js';

export enum MovementType {
  IN = 'IN', // Barang Masuk (Menambah Stok)
  OUT = 'OUT', // Barang Keluar (Mengurangi Stok)
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  referenceNumber: string; // Contoh: TRX-IN-2026001

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Column({ type: 'date' })
  movementDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'warehouse_id' })
  warehouseId: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.stockMovements, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @OneToMany(() => StockMovementItem, (item) => item.stockMovement)
  items: StockMovementItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
