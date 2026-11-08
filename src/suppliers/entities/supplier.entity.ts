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
import { Product } from '../../products/entities/product.entity.js';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 100 })
  contactPerson: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ type: 'text' })
  address: string;

  @OneToMany(() => Product, (product) => product.supplier)
  products: Relation<Product[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
