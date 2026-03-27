import { IMatchingStrategy } from './IMatchingStrategy';
import { Order } from '../../entities/Order';
import { OrderType } from '../../enums';

/**
 * Strategy: PriceTimePriority
 * Matches orders by best price first, then by earliest creation time (FIFO).
 * - For buy orders: find the cheapest sell order
 * - For sell orders: find the highest-paying buy order
 */
export class PriceTimePriorityStrategy implements IMatchingStrategy {
  readonly name = 'PriceTimePriority';

  match(order: Order, candidates: Order[]): Order | null {
    if (candidates.length === 0) return null;

    // Filter compatible candidates
    const compatible = candidates.filter((c) => this.isCompatible(order, c));
    if (compatible.length === 0) return null;

    // Sort by best price, then by earliest time
    compatible.sort((a, b) => {
      const priceA = Number(a.pricePerKwh);
      const priceB = Number(b.pricePerKwh);

      if (order.type === OrderType.BUY) {
        // Buyer wants the cheapest seller
        if (priceA !== priceB) return priceA - priceB;
      } else {
        // Seller wants the highest-paying buyer
        if (priceA !== priceB) return priceB - priceA;
      }

      // Tie-break: earliest order first (FIFO)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return compatible[0];
  }

  private isCompatible(order: Order, candidate: Order): boolean {
    // Must be opposite order types
    if (order.type === candidate.type) return false;

    // Price compatibility: buy price >= sell price
    const buyPrice = order.type === OrderType.BUY
      ? Number(order.pricePerKwh) : Number(candidate.pricePerKwh);
    const sellPrice = order.type === OrderType.SELL
      ? Number(order.pricePerKwh) : Number(candidate.pricePerKwh);

    if (buyPrice < sellPrice) return false;

    // Time window overlap
    const orderStart = new Date(order.timeWindowStart).getTime();
    const orderEnd = new Date(order.timeWindowEnd).getTime();
    const candStart = new Date(candidate.timeWindowStart).getTime();
    const candEnd = new Date(candidate.timeWindowEnd).getTime();

    if (orderStart > candEnd || orderEnd < candStart) return false;

    return true;
  }
}
