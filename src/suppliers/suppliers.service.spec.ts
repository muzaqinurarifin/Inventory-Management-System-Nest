import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SuppliersService } from './suppliers.service.js';
import { Supplier } from './entities/supplier.entity.js';

describe('SuppliersService', () => {
  let service: SuppliersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: getRepositoryToken(Supplier), useValue: {} },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
