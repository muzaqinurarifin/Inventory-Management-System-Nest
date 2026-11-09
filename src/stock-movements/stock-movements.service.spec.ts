import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StockMovementsService } from './stock-movements.service.js';
import { StockMovement } from './entities/stock-movement.entity.js';
import { WarehousesService } from '../warehouses/warehouses.service.js';

describe('StockMovementsService', () => {
  let service: StockMovementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementsService,
        { provide: getRepositoryToken(StockMovement), useValue: {} },
        { provide: WarehousesService, useValue: {} },
      ],
    }).compile();

    service = module.get<StockMovementsService>(StockMovementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
