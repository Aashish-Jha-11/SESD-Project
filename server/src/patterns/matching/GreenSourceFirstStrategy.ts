import { IMatchingStrategy } from './IMatchingStrategy';
import { Order } from '../../entities/Order';
import { OrderType, SourceTypeFilter } from '../../enums';

/**
 * Strategy: GreenSourceFirst
 * Prioritizes renewable energy sources (Solar > Wind > Hydro > Battery).
 * Encourages green energy adoption by matching greener sources first.
 */
export class GreenSourceFirstStrategy implements IMatchingStrategy {
  readonly name = 'GreenSourceFirst';

  private static readonly GREEN_PRIORITY: Record<string, number> = {
    SOLAR: 1,
    WIND: 2,
    HYDRO: 3,
    BATTERY: 4,
    ANY: 5,
  };

  match(order: Order, candidates: Order[]): Order | null {
    if (candidates.length === 0) return null;

    const compatible = candidates.filter((c) => this.isCompatible(order, c));
    if (compatible.length === 0) return null;

    // Sort by green priority (lower = greener), then by price
    compatible.sort((a, b) => {
      const greenA = GreenSourceFirstStrategy.GREEN_PRIORITY[a.sourceType] || 5;
      const greenB = GreenSourceFirstStrategy.GREEN_PRIORITY[b.sourceType] || 5;

      if (greenA !== greenB) return greenA - greenB;

      // Tie-break by price
      const priceA = Number(a.pricePerKwh);
      const priceB = Number(b.pricePerKwh);
      if (order.type === OrderType.BUY) return priceA - priceB;
      return priceB - priceA;
    });

    return compatible[0];
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
