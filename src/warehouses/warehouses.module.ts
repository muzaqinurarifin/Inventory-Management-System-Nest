import { Module } from '@nestjs/common';
import { WarehousesService } from './warehouses.service.js';
import { WarehousesController } from './warehouses.controller.js';
import { Warehouse } from './entities/warehouse.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse])],
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [TypeOrmModule, WarehousesService],
})
export class WarehousesModule {}
