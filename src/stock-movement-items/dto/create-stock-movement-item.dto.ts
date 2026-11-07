// src/stock-movement-items/dto/create-stock-movement-item.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateStockMovementItemDto {
  @IsInt()
  @IsNotEmpty()
  stockMovementId: number;

  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1, { message: 'Kuantitas barang minimal 1' })
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
