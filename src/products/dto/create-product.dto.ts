// src/products/dto/create-product.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  unit?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsInt()
  @IsNotEmpty()
  supplierId: number;
}
