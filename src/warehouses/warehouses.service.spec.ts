import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WarehousesService } from './warehouses.service.js';
import { Warehouse } from './entities/warehouse.entity.js';

describe('WarehousesService', () => {
  let service: WarehousesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehousesService,
        { provide: getRepositoryToken(Warehouse), useValue: {} },
      ],
    }).compile();

    service = module.get<WarehousesService>(WarehousesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
