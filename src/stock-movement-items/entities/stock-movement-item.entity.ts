import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StockMovement } from '../../stock-movements/entities/stock-movement.entity.js';
import { Product } from '../../products/entities/product.entity.js';

@Entity('stock_movement_items')
export class StockMovementItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stock_movement_id' })
  stockMovementId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  remarks: string; // Catatan kondisi barang per item

  @ManyToOne(() => StockMovement, (movement) => movement.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stock_movement_id' })
  stockMovement: StockMovement;

  @ManyToOne(() => Product, (product) => product.stockMovementItems, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
