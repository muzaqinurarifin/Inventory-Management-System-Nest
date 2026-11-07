import { Test, TestingModule } from '@nestjs/testing';
import { StockMovementItemsController } from './stock-movement-items.controller.js';
import { StockMovementItemsService } from './stock-movement-items.service.js';

describe('StockMovementItemsController', () => {
  let controller: StockMovementItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockMovementItemsController],
      providers: [StockMovementItemsService],
    }).compile();

    controller = module.get<StockMovementItemsController>(StockMovementItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
