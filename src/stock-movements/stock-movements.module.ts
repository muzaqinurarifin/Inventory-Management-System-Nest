import { Module } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service.js';
import { StockMovementsController } from './stock-movements.controller.js';
import { WarehousesModule } from '../warehouses/warehouses.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovement } from './entities/stock-movement.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement]), WarehousesModule],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
  exports: [TypeOrmModule, StockMovementsService],
})
export class StockMovementsModule {}
