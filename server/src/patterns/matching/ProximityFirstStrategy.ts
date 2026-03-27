import { IMatchingStrategy } from './IMatchingStrategy';
import { Order } from '../../entities/Order';
import { OrderType } from '../../enums';

/**
 * Strategy: ProximityFirst
 * Prioritizes orders from the same grid zone, then falls back to price.
 * Encourages local energy trading within microgrids.
 */
export class ProximityFirstStrategy implements IMatchingStrategy {
  readonly name = 'ProximityFirst';

  match(order: Order, candidates: Order[]): Order | null {
    if (candidates.length === 0) return null;

    const compatible = candidates.filter((c) => this.isCompatible(order, c));
    if (compatible.length === 0) return null;

    // Separate same-zone and cross-zone candidates
    const sameZone = compatible.filter((c) => c.gridZoneId === order.gridZoneId);
    const crossZone = compatible.filter((c) => c.gridZoneId !== order.gridZoneId);

    // Prefer same-zone matches, sorted by best price
    const pool = sameZone.length > 0 ? sameZone : crossZone;

    pool.sort((a, b) => {
      const priceA = Number(a.pricePerKwh);
      const priceB = Number(b.pricePerKwh);
      if (order.type === OrderType.BUY) return priceA - priceB;
      return priceB - priceA;
    });

    return pool[0];
  }

  private isCompatible(order: Order, candidate: Order): boolean {
    if (order.type === candidate.type) return false;

    const buyPrice = order.type === OrderType.BUY
      ? Number(order.pricePerKwh) : Number(candidate.pricePerKwh);
    const sellPrice = order.type === OrderType.SELL
      ? Number(order.pricePerKwh) : Number(candidate.pricePerKwh);

    return buyPrice >= sellPrice;
  }
}
