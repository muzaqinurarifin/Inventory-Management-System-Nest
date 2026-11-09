import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement, MovementType } from './entities/stock-movement.entity.js';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto.js';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto.js';
import { WarehousesService } from '../warehouses/warehouses.service.js';
import { syncProductStock } from '../common/stock-calculator.js';
import { assignDefined } from '../common/assign-defined.js';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    private readonly warehousesService: WarehousesService,
  ) {}

  async create(dto: CreateStockMovementDto) {
    const exists = await this.movementRepo.findOne({
      where: { referenceNumber: dto.referenceNumber },
    });
    if (exists) {
      throw new ConflictException(
        `Nomor referensi ${dto.referenceNumber} sudah terdaftar`,
      );
    }

    await this.warehousesService.findOne(dto.warehouseId);

    const movement = this.movementRepo.create(dto);
    return this.movementRepo.save(movement);
  }

  // bisa difilter berdasarkan tipe transaksi
  findAll(type?: MovementType) {
    const whereCondition = type ? { type } : {};
    return this.movementRepo.find({
      where: whereCondition,
      relations: {
        warehouse: true,
        items: {
          product: true,
        },
      },
      order: { movementDate: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: string) {
    const movement = await this.movementRepo.findOne({
      where: { id },
      relations: {
        warehouse: true,
        items: {
          product: true,
        },
      },
    });
    if (!movement) {
      throw new NotFoundException(
        `Transaksi stok dengan ID ${id} tidak ditemukan`,
      );
    }
    return movement;
  }

  async update(id: string, dto: UpdateStockMovementDto) {
    return this.movementRepo.manager.transaction(async (manager) => {
      const movementRepo = manager.getRepository(StockMovement);

      const movement = await movementRepo.findOne({
        where: { id },
        relations: {
          warehouse: true,
          items: {
            product: true,
          },
        },
      });
      if (!movement) {
        throw new NotFoundException(
          `Transaksi stok dengan ID ${id} tidak ditemukan`,
        );
      }

      if (dto.warehouseId && dto.warehouseId !== movement.warehouseId) {
        await this.warehousesService.findOne(dto.warehouseId);
      }

      if (
        dto.referenceNumber &&
        dto.referenceNumber !== movement.referenceNumber
      ) {
        const exists = await movementRepo.findOne({
          where: { referenceNumber: dto.referenceNumber },
        });
        if (exists) {
          throw new ConflictException(
            `Nomor referensi ${dto.referenceNumber} sudah terdaftar`,
          );
        }
      }

      const typeChanged =
        dto.type !== undefined && dto.type !== movement.type;

      assignDefined(movement, dto);
      await movementRepo.save(movement);

      // jika tipe IN <-> OUT berubah, seluruh item ikut berubah arahnya
      if (typeChanged) {
        const affectedProductIds = new Set(
          movement.items.map((item) => item.productId),
        );
        for (const productId of affectedProductIds) {
          await syncProductStock(
            manager,
            productId,
            'Tipe transaksi tidak dapat diubah karena stok produk terkait tidak mencukupi',
          );
        }
      }

      return movementRepo.findOne({
        where: { id },
        relations: {
          warehouse: true,
          items: {
            product: true,
          },
        },
      });
    });
  }

  async remove(id: string) {
    return this.movementRepo.manager.transaction(async (manager) => {
      const movementRepo = manager.getRepository(StockMovement);

      const movement = await movementRepo.findOne({
        where: { id },
        relations: {
          items: {
            product: true,
          },
        },
      });
      if (!movement) {
        throw new NotFoundException(
          `Transaksi stok dengan ID ${id} tidak ditemukan`,
        );
      }

      const affectedProductIds = new Set(
        movement.items.map((item) => item.productId),
      );
      const referenceNumber = movement.referenceNumber;

      // cascade soft-remove untuk seluruh item transaksi
      await movementRepo.softRemove(movement);

      // kembalikan stok produk seperti sebelum transaksi ini dibuat
      for (const productId of affectedProductIds) {
        await syncProductStock(
          manager,
          productId,
          'Transaksi stok tidak dapat dihapus karena stok dari transaksi masuk sudah terpakai pada transaksi keluar',
        );
      }

      return {
        message: `Transaksi stok ${referenceNumber} berhasil dihapus`,
      };
    });
  }
}
