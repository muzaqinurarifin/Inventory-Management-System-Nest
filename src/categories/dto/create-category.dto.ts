// src/categories/dto/create-category.dto.ts
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
