// src/stock-movements/stock-movements.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service.js';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto.js';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto.js';
import { MovementType } from './entities/stock-movement.entity.js';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  create(@Body() dto: CreateStockMovementDto) {
    return this.stockMovementsService.create(dto);
  }

  @Get()
  findAll(@Query('type') type?: MovementType) {
    return this.stockMovementsService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockMovementsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockMovementDto,
  ) {
    return this.stockMovementsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockMovementsService.remove(id);
  }
}
