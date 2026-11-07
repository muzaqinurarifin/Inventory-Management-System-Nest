// src/stock-movement-items/dto/create-stock-movement-item.dto.ts
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateStockMovementItemDto {
  @IsUUID()
  @IsNotEmpty()
  stockMovementId: string;

  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1, { message: 'Kuantitas barang minimal 1' })
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
