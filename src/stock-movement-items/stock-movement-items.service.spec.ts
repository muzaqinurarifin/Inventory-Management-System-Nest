import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StockMovementItemsService } from './stock-movement-items.service.js';
import { StockMovementItem } from './entities/stock-movement-item.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity.js';

describe('StockMovementItemsService', () => {
  let service: StockMovementItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementItemsService,
        { provide: getRepositoryToken(StockMovementItem), useValue: {} },
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: getRepositoryToken(StockMovement), useValue: {} },
      ],
    }).compile();

    service = module.get<StockMovementItemsService>(StockMovementItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
