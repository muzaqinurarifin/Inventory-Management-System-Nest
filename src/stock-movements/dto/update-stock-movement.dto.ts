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

export class UpdateStockMovementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsOptional()
  referenceNumber?: string;

  @IsEnum(MovementType, {
    message: 'Tipe transaksi harus IN (Barang Masuk) atau OUT (Barang Keluar)',
  })
  @IsNotEmpty()
  @IsOptional()
  type?: MovementType;

  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  movementDate?: string;

  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  warehouseId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
