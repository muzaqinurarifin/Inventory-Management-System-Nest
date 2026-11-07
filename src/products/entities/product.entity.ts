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
import { Category } from '../../categories/entities/category.entity.js';
import { Supplier } from '../../suppliers/entities/supplier.entity.js';
import { StockMovementItem } from '../../stock-movement-items/entities/stock-movement-item.entity.js';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ unique: true, length: 50 })
  sku: string; // Kode unik barang, contoh: PRD-ELK-001

  @Column({ length: 150 })
  name: string;

  @Column({ length: 30, default: 'pcs' })
  unit: string; // Satuan: pcs, box, unit, kg

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'int', default: 0 })
  currentStock: number; // Stok aktif yang otomatis bertambah/berkurang dari transaksi

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'supplier_id' })
  supplierId: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Supplier, (supplier) => supplier.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => StockMovementItem, (item) => item.product)
  stockMovementItems: StockMovementItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
