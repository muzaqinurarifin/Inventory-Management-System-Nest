import { Module } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { SuppliersModule } from '../suppliers/suppliers.module.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoriesModule,
    SuppliersModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
