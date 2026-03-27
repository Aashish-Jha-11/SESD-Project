import { Order } from '../../entities/Order';

/**
 * Strategy Pattern — Interface for order matching algorithms.
 * Different strategies can be swapped at runtime to change how
 * buy/sell orders are matched in the marketplace.
 */
export interface IMatchingStrategy {
  /** Name of the strategy for logging/display */
  readonly name: string;

  /**
   * Match a given order against a list of candidate counter-orders.
   * Returns the best matching order, or null if no match is found.
   */
  match(order: Order, candidates: Order[]): Order | null;
}
