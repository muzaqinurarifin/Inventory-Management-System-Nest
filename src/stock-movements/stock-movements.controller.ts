import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service.js';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto.js';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto.js';
import { FindStockMovementsQueryDto } from './dto/find-stock-movements-query.dto.js';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  create(@Body() dto: CreateStockMovementDto) {
    return this.stockMovementsService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindStockMovementsQueryDto) {
    return this.stockMovementsService.findAll(query.type);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.stockMovementsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockMovementDto,
  ) {
    return this.stockMovementsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.stockMovementsService.remove(id);
  }
}
