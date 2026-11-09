import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity.js';
import { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';
import { assignDefined } from '../common/assign-defined.js';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  async create(dto: CreateWarehouseDto) {
    const exists = await this.warehouseRepo.findOne({
      where: { code: dto.code },
    });
    if (exists) {
      throw new ConflictException(`Kode gudang ${dto.code} sudah digunakan`);
    }
    const warehouse = this.warehouseRepo.create(dto);
    return this.warehouseRepo.save(warehouse);
  }

  findAll() {
    return this.warehouseRepo.find();
  }

  async findOne(id: string) {
    const warehouse = await this.warehouseRepo.findOne({
      where: { id },
      relations: {stockMovements: true},
    });
    if (!warehouse) {
      throw new NotFoundException(`Gudang dengan ID ${id} tidak ditemukan`);
    }
    return warehouse;
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    const warehouse = await this.findOne(id);
    if (dto.code && dto.code !== warehouse.code) {
      const exists = await this.warehouseRepo.findOne({
        where: { code: dto.code },
      });
      if (exists) {
        throw new ConflictException(`Kode gudang ${dto.code} sudah digunakan`);
      }
    }
    assignDefined(warehouse, dto);
    return this.warehouseRepo.save(warehouse);
  }

  async remove(id: string) {
    const warehouse = await this.findOne(id);
    await this.warehouseRepo.softRemove(warehouse);
    return { message: `Gudang ${warehouse.name} berhasil dihapus` };
  }
}
