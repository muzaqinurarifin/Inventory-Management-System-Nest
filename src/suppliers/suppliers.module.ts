import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service.js';
import { SuppliersController } from './suppliers.controller.js';
import { Supplier } from './entities/supplier.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [TypeOrmModule, SuppliersService],
})
export class SuppliersModule {}
