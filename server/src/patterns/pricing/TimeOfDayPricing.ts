import { IPricingStrategy } from './IPricingStrategy';
import { GridZone } from '../../entities/GridZone';

export class TimeOfDayPricing implements IPricingStrategy {
  readonly name = 'TimeOfDay';

  private readonly basePrice: number;

  private static readonly MULTIPLIERS: Record<string, number> = {
    off_peak: 0.6,
    shoulder: 1.0,
    peak: 1.5,
    super_peak: 2.0,
  };

  constructor(basePrice = 5.0) {
    this.basePrice = basePrice;
  }

  calculatePrice(zone: GridZone, supply: number, demand: number): number {
    const hour = new Date().getHours();
    const period = this.getPeriod(hour);
    const multiplier = TimeOfDayPricing.MULTIPLIERS[period];

    let price = this.basePrice * multiplier;

    if (supply > 0 && demand > 0) {
      const ratio = supply / demand;
      if (ratio > 1.2) price *= 0.9;
      else if (ratio < 0.8) price *= 1.1;
    }

    return Number(price.toFixed(4));
  }

  private getPeriod(hour: number): string {
    if (hour >= 0 && hour < 6) return 'off_peak';
    if (hour >= 6 && hour < 9) return 'shoulder';
    if (hour >= 9 && hour < 17) return 'peak';
    if (hour >= 17 && hour < 21) return 'super_peak';
    return 'shoulder';
  }
}
