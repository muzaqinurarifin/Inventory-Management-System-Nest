import { PartialType } from '@nestjs/mapped-types';
import { CreateStockMovementItemDto } from './create-stock-movement-item.dto.js';

export class UpdateStockMovementItemDto extends PartialType(CreateStockMovementItemDto) {}
