import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CategoriesModule } from './categories/categories.module.js';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { WarehousesModule } from './warehouses/warehouses.module.js';
import { ProductsModule } from './products/products.module.js';
import { StockMovementsModule } from './stock-movements/stock-movements.module.js';
import { StockMovementItemsModule } from './stock-movement-items/stock-movement-items.module.js';
import Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    CategoriesModule,
    SuppliersModule,
    WarehousesModule,
    ProductsModule,
    StockMovementsModule,
    StockMovementItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
