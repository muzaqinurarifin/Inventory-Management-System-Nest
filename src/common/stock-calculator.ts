import { BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Product } from '../products/entities/product.entity.js';
import { StockMovementItem } from '../stock-movement-items/entities/stock-movement-item.entity.js';
import { MovementType } from '../stock-movements/entities/stock-movement.entity.js';

/**
 * Menghitung stok produk dari seluruh item transaksi yang masih aktif
 * (belum di-soft-delete). Stok dihitung ulang dari sumbernya agar tidak
 * pernah melenceng dari histori transaksi.
 */
export async function calculateProductStock(
  manager: EntityManager,
  productId: string,
): Promise<number> {
  const items = await manager.getRepository(StockMovementItem).find({
    where: { productId },
    relations: { stockMovement: true },
  });

  let stock = 0;
  for (const item of items) {
    if (!item.stockMovement) continue;
    if (item.stockMovement.type === MovementType.IN) {
      stock += item.quantity;
    } else if (item.stockMovement.type === MovementType.OUT) {
      stock -= item.quantity;
    }
  }
  return stock;
}

/**
 * Menghitung ulang lalu menyimpan currentStock produk.
 * Jika hasilnya negatif, transaksi dibatalkan (rollback) dengan 400.
 */
export async function syncProductStock(
  manager: EntityManager,
  productId: string,
  insufficientMessage: string,
): Promise<number> {
  const stock = await calculateProductStock(manager, productId);
  if (stock < 0) {
    throw new BadRequestException(insufficientMessage);
  }
  await manager
    .getRepository(Product)
    .update({ id: productId }, { currentStock: stock });
  return stock;
}
