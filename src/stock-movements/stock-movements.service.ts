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

  // Bisa difilter berdasarkan tipe (?type=IN atau ?type=OUT)
  findAll(type?: MovementType) {
    const whereCondition = type ? { type } : {};
    return this.movementRepo.find({
      where: whereCondition,
      relations: ['warehouse', 'items', 'items.product'],
      
      order: { movementDate: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const movement = await this.movementRepo.findOne({
      where: { id },
      relations: ['warehouse', 'items', 'items.product'],
    });
    if (!movement) {
      throw new NotFoundException(
        `Transaksi stok dengan ID ${id} tidak ditemukan`,
      );
    }
    return movement;
  }

  async update(id: number, dto: UpdateStockMovementDto) {
    const movement = await this.findOne(id);
    if (dto.warehouseId) {
      await this.warehousesService.findOne(dto.warehouseId);
    }
    Object.assign(movement, dto);
    return this.movementRepo.save(movement);
  }

  async remove(id: number) {
    const movement = await this.findOne(id);
    await this.movementRepo.remove(movement);
    return {
      message: `Transaksi stok ${movement.referenceNumber} berhasil dihapus`,
    };
  }
}
