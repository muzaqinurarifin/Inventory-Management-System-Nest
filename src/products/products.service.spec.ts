import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service.js';
import { Product } from './entities/product.entity.js';
import { CategoriesService } from '../categories/categories.service.js';
import { SuppliersService } from '../suppliers/suppliers.service.js';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: CategoriesService, useValue: {} },
        { provide: SuppliersService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
