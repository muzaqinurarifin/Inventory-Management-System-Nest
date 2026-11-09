import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { assignDefined } from '../common/assign-defined.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const exists = await this.categoryRepo.findOne({
      where: { name: dto.name },
    });
    if (exists) {
      throw new ConflictException(`Kategori ${dto.name} sudah ada`);
    }
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  findAll() {
    return this.categoryRepo.find({ relations: { products: true } });
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { products: true },
    });
    if (!category) {
      throw new NotFoundException(`Kategori dengan ID ${id} tidak ditemukan`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (dto.name && dto.name !== category.name) {
      const exists = await this.categoryRepo.findOne({
        where: { name: dto.name },
      });
      if (exists) {
        throw new ConflictException(`Kategori ${dto.name} sudah ada`);
      }
    }
    assignDefined(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoryRepo.softRemove(category);
    return { message: `Kategori ${category.name} berhasil dihapus` };
  }
}
