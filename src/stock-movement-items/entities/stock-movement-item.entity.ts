import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  type Relation,
} from 'typeorm';
import { StockMovement } from '../../stock-movements/entities/stock-movement.entity.js';
import { Product } from '../../products/entities/product.entity.js';

@Entity('stock_movement_items')
export class StockMovementItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'stock_movement_id', type: 'uuid' })
  stockMovementId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  remarks: string; // catatan kondisi barang per item

  @ManyToOne(() => StockMovement, (movement) => movement.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stock_movement_id' })
  stockMovement: Relation<StockMovement>;

  @ManyToOne(() => Product, (product) => product.stockMovementItems, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
