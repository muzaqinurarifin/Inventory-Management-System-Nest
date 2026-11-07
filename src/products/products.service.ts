import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CategoriesService } from '../categories/categories.service.js';
import { SuppliersService } from '../suppliers/suppliers.service.js';
import { MovementType } from '../stock-movements/entities/stock-movement.entity.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly categoriesService: CategoriesService,
    private readonly suppliersService: SuppliersService,
  ) {}

  async create(dto: CreateProductDto) {
    const skuExists = await this.productRepo.findOne({
      where: { sku: dto.sku },
    });
    if (skuExists) {
      throw new ConflictException(
        `Produk dengan SKU ${dto.sku} sudah terdaftar`,
      );
    }

    await this.categoriesService.findOne(dto.categoryId);
    await this.suppliersService.findOne(dto.supplierId);

    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  findAll() {
    return this.productRepo.find({
      relations: {
        category: true,
        supplier: true,
      },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: {
        category: true,
        supplier: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);
    }
    return product;
  }

  // Fitur Utama 5: Menampilkan informasi stok produk beserta rekap transaksi IN dan OUT
  async getProductStockInfo(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: {
        category: true,
        supplier: true,
        stockMovementItems: {
          stockMovement: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);
    }

    let totalIn = 0;
    let totalOut = 0;

    for (const item of product.stockMovementItems) {
      if (item.stockMovement?.type === MovementType.IN) {
        totalIn += item.quantity;
      } else if (item.stockMovement?.type === MovementType.OUT) {
        totalOut += item.quantity;
      }
    }

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      totalIn,
      totalOut,
      currentStock: product.currentStock,
      calculatedStock: totalIn - totalOut,
      transactionHistory: product.stockMovementItems,
    };
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (dto.categoryId) await this.categoriesService.findOne(dto.categoryId);
    if (dto.supplierId) await this.suppliersService.findOne(dto.supplierId);

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    return { message: `Produk ${product.name} berhasil dihapus` };
  }
}
