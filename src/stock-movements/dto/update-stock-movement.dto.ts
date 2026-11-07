import { PartialType } from '@nestjs/mapped-types';
import { CreateStockMovementDto } from './create-stock-movement.dto.js';

export class UpdateStockMovementDto extends PartialType(CreateStockMovementDto) {}
