import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovementItem } from './entities/stock-movement-item.entity.js';
import { CreateStockMovementItemDto } from './dto/create-stock-movement-item.dto.js';
import { UpdateStockMovementItemDto } from './dto/update-stock-movement-item.dto.js';
import { Product } from '../products/entities/product.entity.js';
import {
  StockMovement,
  MovementType,
} from '../stock-movements/entities/stock-movement.entity.js';

@Injectable()
export class StockMovementItemsService {
  constructor(
    @InjectRepository(StockMovementItem)
    private readonly itemRepo: Repository<StockMovementItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
  ) {}

  async create(dto: CreateStockMovementItemDto) {
    const movement = await this.movementRepo.findOne({
      where: { id: dto.stockMovementId },
    });
    if (!movement) {
      throw new NotFoundException(
        `Transaksi stok ID ${dto.stockMovementId} tidak ditemukan`,
      );
    }

    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException(`Produk ID ${dto.productId} tidak ditemukan`);
    }

    // Logika perhitungan stok berdasarkan jenis transaksi (IN / OUT)
    if (movement.type === MovementType.IN) {
      product.currentStock += dto.quantity;
    } else if (movement.type === MovementType.OUT) {
      if (product.currentStock < dto.quantity) {
        throw new BadRequestException(
          `Stok produk "${product.name}" tidak mencukupi. Stok tersedia: ${product.currentStock}, diminta: ${dto.quantity}`,
        );
      }
      product.currentStock -= dto.quantity;
    }

    await this.productRepo.save(product);

    const item = this.itemRepo.create(dto);
    return this.itemRepo.save(item);
  }

  findAll() {
    return this.itemRepo.find({
      relations: {
        stockMovement: true,
        product: true,
      },
    });
  }

  async findOne(id: string) {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: {
        stockMovement: true,
        product: true,
      },
    });
    if (!item) {
      throw new NotFoundException(
        `Detail item transaksi ID ${id} tidak ditemukan`,
      );
    }
    return item;
  }

  async update(id: string, dto: UpdateStockMovementItemDto) {
    const item = await this.findOne(id);
    const product = await this.productRepo.findOne({
      where: { id: item.productId },
    });
    if (!product) {
      throw new NotFoundException(`Produk tidak ditemukan`);
    }

    // Jika kuantitas diubah, hitung selisihnya terhadap stok produk
    if (dto.quantity !== undefined && dto.quantity !== item.quantity) {
      // 1. Kembalikan (rollback) efek kuantitas lama
      if (item.stockMovement.type === MovementType.IN) {
        product.currentStock -= item.quantity;
      } else {
        product.currentStock += item.quantity;
      }

      // 2. Terapkan kuantitas baru
      if (item.stockMovement.type === MovementType.IN) {
        product.currentStock += dto.quantity;
      } else {
        if (product.currentStock < dto.quantity) {
          throw new BadRequestException(
            `Stok produk tidak mencukupi untuk pembaruan kuantitas. Stok tersedia: ${product.currentStock}`,
          );
        }
        product.currentStock -= dto.quantity;
      }

      await this.productRepo.save(product);
    }

    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    const product = await this.productRepo.findOne({
      where: { id: item.productId },
    });

    // Kembalikan stok produk ke kondisi semula sebelum item dihapus
    if (product && item.stockMovement) {
      if (item.stockMovement.type === MovementType.IN) {
        if (product.currentStock < item.quantity) {
          throw new BadRequestException(
            'Item barang masuk tidak dapat dihapus karena stok tersebut sudah terpakai di transaksi keluar',
          );
        }
        product.currentStock -= item.quantity;
      } else if (item.stockMovement.type === MovementType.OUT) {
        product.currentStock += item.quantity;
      }
      await this.productRepo.save(product);
    }

    await this.itemRepo.softRemove(item);
    return {
      message: `Item transaksi ID ${id} berhasil dihapus dan stok produk telah diperbarui`,
    };
  }
}
