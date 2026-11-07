import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateStockMovementItemDto {
  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  stockMovementId?: string;

  @IsUUID()
  @IsNotEmpty()
  @IsOptional()
  productId?: string;

  @IsInt()
  @Min(1, { message: 'Kuantitas barang minimal 1' })
  @IsNotEmpty()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
