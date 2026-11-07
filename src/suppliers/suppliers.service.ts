import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity.js';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto) {
    const exists = await this.supplierRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException(`Email pemasok ${dto.email} sudah terdaftar`);
    }
    const supplier = this.supplierRepo.create(dto);
    return this.supplierRepo.save(supplier);
  }

  findAll() {
    return this.supplierRepo.find({ relations: ['products'] });
  }

  async findOne(id: number) {
    const supplier = await this.supplierRepo.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!supplier) {
      throw new NotFoundException(`Pemasok dengan ID ${id} tidak ditemukan`);
    }
    return supplier;
  }

  async update(id: number, dto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    Object.assign(supplier, dto);
    return this.supplierRepo.save(supplier);
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    await this.supplierRepo.remove(supplier);
    return { message: `Pemasok ${supplier.name} berhasil dihapus` };
  }
}
