// src/stock-movements/dto/create-stock-movement.dto.ts
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
