import { IsEnum, IsOptional } from 'class-validator';
import { MovementType } from '../entities/stock-movement.entity.js';

export class FindStockMovementsQueryDto {
  @IsEnum(MovementType, {
    message: 'Filter tipe transaksi harus IN (Barang Masuk) atau OUT (Barang Keluar)',
  })
  @IsOptional()
  type?: MovementType;
}
