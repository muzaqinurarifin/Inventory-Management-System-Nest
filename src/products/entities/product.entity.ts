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
import { Category } from '../../categories/entities/category.entity.js';
import { Supplier } from '../../suppliers/entities/supplier.entity.js';
import { StockMovementItem } from '../../stock-movement-items/entities/stock-movement-item.entity.js';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  sku: string; // kode unik barang, contoh: prd-elk-001

  @Column({ length: 150 })
  name: string;

  @Column({ length: 30, default: 'pcs' })
  unit: string; // satuan: pcs, box, unit, kg

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'int', default: 0 })
  currentStock: number; // stok aktif yang otomatis bertambah/berkurang dari transaksi

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: Relation<Category>;

  @ManyToOne(() => Supplier, (supplier) => supplier.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Relation<Supplier>;

  @OneToMany(() => StockMovementItem, (item) => item.product)
  stockMovementItems: Relation<StockMovementItem[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
