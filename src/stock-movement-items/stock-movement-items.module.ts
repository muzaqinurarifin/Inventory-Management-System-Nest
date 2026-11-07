import { Module } from '@nestjs/common';
import { StockMovementItemsService } from './stock-movement-items.service.js';
import { StockMovementItemsController } from './stock-movement-items.controller.js';
import { StockMovementItem } from './entities/stock-movement-item.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovementsModule } from '../stock-movements/stock-movements.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockMovementItem]),
    ProductsModule,
    StockMovementsModule,
  ],
  controllers: [StockMovementItemsController],
  providers: [StockMovementItemsService],
  exports: [TypeOrmModule, StockMovementItemsService],
})
export class StockMovementItemsModule {}
