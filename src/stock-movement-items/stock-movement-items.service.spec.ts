import { Test, TestingModule } from '@nestjs/testing';
import { StockMovementItemsService } from './stock-movement-items.service.js';

describe('StockMovementItemsService', () => {
  let service: StockMovementItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockMovementItemsService],
    }).compile();

    service = module.get<StockMovementItemsService>(StockMovementItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
