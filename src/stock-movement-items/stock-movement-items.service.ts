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
import {
  calculateProductStock,
  syncProductStock,
} from '../common/stock-calculator.js';
import { assignDefined } from '../common/assign-defined.js';

const STOCK_NOT_ENOUGH_MESSAGE =
  'Stok produk tidak mencukupi untuk pembaruan item transaksi';

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
    return this.itemRepo.manager.transaction(async (manager) => {
      const itemRepo = manager.getRepository(StockMovementItem);
      const movementRepo = manager.getRepository(StockMovement);
      const productRepo = manager.getRepository(Product);

      const movement = await movementRepo.findOne({
        where: { id: dto.stockMovementId },
      });
      if (!movement) {
        throw new NotFoundException(
          `Transaksi stok ID ${dto.stockMovementId} tidak ditemukan`,
        );
      }

      const product = await productRepo.findOne({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Produk ID ${dto.productId} tidak ditemukan`,
        );
      }

      // validasi stok berdasarkan histori transaksi, bukan angka tersimpan
      if (movement.type === MovementType.OUT) {
        const available = await calculateProductStock(manager, product.id);
        if (available < dto.quantity) {
          throw new BadRequestException(
            `Stok produk "${product.name}" tidak mencukupi. Stok tersedia: ${available}, diminta: ${dto.quantity}`,
          );
        }
      }

      const item = itemRepo.create(dto);
      const saved = await itemRepo.save(item);

      await syncProductStock(
        manager,
        product.id,
        `Stok produk "${product.name}" tidak mencukupi`,
      );

      return saved;
    });
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
    return this.itemRepo.manager.transaction(async (manager) => {
      const itemRepo = manager.getRepository(StockMovementItem);
      const movementRepo = manager.getRepository(StockMovement);
      const productRepo = manager.getRepository(Product);

      const item = await itemRepo.findOne({
        where: { id },
        relations: { stockMovement: true, product: true },
      });
      if (!item) {
        throw new NotFoundException(
          `Detail item transaksi ID ${id} tidak ditemukan`,
        );
      }

      const previousProductId = item.productId;

      // pindah dokumen transaksi
      if (
        dto.stockMovementId &&
        dto.stockMovementId !== item.stockMovementId
      ) {
        const movement = await movementRepo.findOne({
          where: { id: dto.stockMovementId },
        });
        if (!movement) {
          throw new NotFoundException(
            `Transaksi stok ID ${dto.stockMovementId} tidak ditemukan`,
          );
        }
        item.stockMovement = movement;
      }

      // pindah produk
      if (dto.productId && dto.productId !== item.productId) {
        const product = await productRepo.findOne({
          where: { id: dto.productId },
        });
        if (!product) {
          throw new NotFoundException(
            `Produk ID ${dto.productId} tidak ditemukan`,
          );
        }
        item.product = product;
      }

      assignDefined(item, dto);
      await itemRepo.save(item);

      // hitung ulang stok produk lama dan produk baru (jika berpindah)
      const affectedProductIds = new Set([
        previousProductId,
        item.productId,
      ]);
      for (const productId of affectedProductIds) {
        await syncProductStock(
          manager,
          productId,
          STOCK_NOT_ENOUGH_MESSAGE,
        );
      }

      return itemRepo.findOne({
        where: { id },
        relations: { stockMovement: true, product: true },
      });
    });
  }

  async remove(id: string) {
    return this.itemRepo.manager.transaction(async (manager) => {
      const itemRepo = manager.getRepository(StockMovementItem);

      const item = await itemRepo.findOne({
        where: { id },
        relations: { stockMovement: true, product: true },
      });
      if (!item) {
        throw new NotFoundException(
          `Detail item transaksi ID ${id} tidak ditemukan`,
        );
      }

      const productId = item.productId;

      await itemRepo.softRemove(item);

      await syncProductStock(
        manager,
        productId,
        'Item barang masuk tidak dapat dihapus karena stok tersebut sudah terpakai di transaksi keluar',
      );

      return {
        message: `Item transaksi ID ${id} berhasil dihapus dan stok produk telah diperbarui`,
      };
    });
  }
}
