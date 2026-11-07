// src/stock-movements/dto/create-stock-movement.dto.ts
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { MovementType } from '../entities/stock-movement.entity.js';

export class CreateStockMovementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  referenceNumber: string;

  @IsEnum(MovementType, {
    message: 'Tipe transaksi harus IN (Barang Masuk) atau OUT (Barang Keluar)',
  })
  @IsNotEmpty()
  type: MovementType;

  @IsDateString()
  @IsNotEmpty()
  movementDate: string; // Format: YYYY-MM-DD

  @IsInt()
  @IsNotEmpty()
  warehouseId: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
