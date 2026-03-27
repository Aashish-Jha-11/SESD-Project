import { IPricingStrategy } from './IPricingStrategy';
import { GridZone } from '../../entities/GridZone';

export class SupplyDemandPricing implements IPricingStrategy {
  readonly name = 'SupplyDemand';

  private readonly basePrice: number;
  private readonly minPrice: number;
  private readonly maxPrice: number;

  constructor(basePrice = 5.0, minPrice = 1.0, maxPrice = 20.0) {
    this.basePrice = basePrice;
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
  }

  calculatePrice(zone: GridZone, supply: number, demand: number): number {
    if (supply === 0 && demand === 0) return this.basePrice;

    const ratio = demand > 0 ? supply / demand : 2.0;
    let price: number;

    if (ratio > 1.5) {
      price = this.basePrice * 0.7;
    } else if (ratio > 1.0) {
      price = this.basePrice * 0.9;
    } else if (ratio > 0.5) {
      price = this.basePrice * 1.2;
    } else {
      price = this.basePrice * 1.5;
    }

    if (zone.isOverloaded()) {
      price *= 0.8;
    }

    return Math.max(this.minPrice, Math.min(this.maxPrice, Number(price.toFixed(4))));
  }
}
