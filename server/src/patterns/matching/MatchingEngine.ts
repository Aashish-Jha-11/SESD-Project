import { IMatchingStrategy } from './IMatchingStrategy';
import { Order } from '../../entities/Order';
import { PriceTimePriorityStrategy } from './PriceTimePriorityStrategy';

/**
 * Matching Engine — Uses Strategy pattern to swap matching algorithms.
 * Acts as the context that delegates matching to the current strategy.
 */
export class MatchingEngine {
  private strategy: IMatchingStrategy;

  constructor(strategy?: IMatchingStrategy) {
    // Default strategy
    this.strategy = strategy || new PriceTimePriorityStrategy();
  }

  /**
   * Swap the matching strategy at runtime (Strategy pattern).
   */
  setStrategy(strategy: IMatchingStrategy): void {
    this.strategy = strategy;
    console.log(`[MatchingEngine] Strategy changed to: ${strategy.name}`);
  }

  /**
   * Get the current strategy name.
   */
  getStrategyName(): string {
    return this.strategy.name;
  }

  /**
   * Find the best matching counter-order for the given order.
   */
  findMatch(order: Order, candidates: Order[]): Order | null {
    console.log(
      `[MatchingEngine] Finding match for Order ${order.id} ` +
      `using ${this.strategy.name} strategy ` +
      `(${candidates.length} candidates)`
    );

    const match = this.strategy.match(order, candidates);

    if (match) {
      console.log(`[MatchingEngine] Match found: Order ${match.id}`);
    } else {
      console.log(`[MatchingEngine] No match found`);
    }

    return match;
  }
}
