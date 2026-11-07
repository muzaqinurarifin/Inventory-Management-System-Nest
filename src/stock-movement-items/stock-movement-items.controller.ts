// src/stock-movement-items/stock-movement-items.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { StockMovementItemsService } from './stock-movement-items.service.js';
import { CreateStockMovementItemDto } from './dto/create-stock-movement-item.dto.js';
import { UpdateStockMovementItemDto } from './dto/update-stock-movement-item.dto.js';

@Controller('stock-movement-items')
export class StockMovementItemsController {
  constructor(private readonly itemsService: StockMovementItemsService) {}

  @Post()
  create(@Body() dto: CreateStockMovementItemDto) {
    return this.itemsService.create(dto);
  }

  @Get()
  findAll() {
    return this.itemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockMovementItemDto,
  ) {
    return this.itemsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.remove(id);
  }
}
