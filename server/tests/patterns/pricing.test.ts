import 'reflect-metadata';
import { SupplyDemandPricing } from '../../src/patterns/pricing/SupplyDemandPricing';
import { TimeOfDayPricing } from '../../src/patterns/pricing/TimeOfDayPricing';
import { GridZone } from '../../src/entities/GridZone';
import { ZoneStatus } from '../../src/enums';

function createZone(overrides: Partial<GridZone> = {}): GridZone {
  const zone = new GridZone();
  zone.id = 'zone-1';
  zone.name = 'Test Zone';
  zone.maxCapacityKw = 5000;
  zone.currentLoadKw = 2000;
  zone.status = ZoneStatus.ACTIVE;
  Object.assign(zone, overrides);
  return zone;
}

describe('SupplyDemandPricing', () => {
  const pricing = new SupplyDemandPricing(5.0, 1.0, 20.0);

  it('should have the correct name', () => {
    expect(pricing.name).toBe('SupplyDemand');
  });

  it('should return base price when no supply or demand', () => {
    const zone = createZone();
    const price = pricing.calculatePrice(zone, 0, 0);
    expect(price).toBe(5.0);
  });

  it('should lower price when supply greatly exceeds demand (ratio > 1.5)', () => {
    const zone = createZone();
    const price = pricing.calculatePrice(zone, 200, 100); // ratio = 2.0
    expect(price).toBe(3.5); // 5.0 * 0.7
  });

  it('should slightly lower price when supply moderately exceeds demand (ratio 1.0-1.5)', () => {
    const zone = createZone();
    const price = pricing.calculatePrice(zone, 120, 100); // ratio = 1.2
    expect(price).toBe(4.5); // 5.0 * 0.9
  });

  it('should raise price when demand exceeds supply (ratio 0.5-1.0)', () => {
    const zone = createZone();
    const price = pricing.calculatePrice(zone, 80, 100); // ratio = 0.8
    expect(price).toBe(6.0); // 5.0 * 1.2
  });

  it('should spike price when demand greatly exceeds supply (ratio < 0.5)', () => {
    const zone = createZone();
    const price = pricing.calculatePrice(zone, 30, 100); // ratio = 0.3
    expect(price).toBe(7.5); // 5.0 * 1.5
  });

  it('should apply overload penalty', () => {
    const zone = createZone({ currentLoadKw: 5000, maxCapacityKw: 5000 }); // overloaded
    const price = pricing.calculatePrice(zone, 0, 0);
    expect(price).toBe(4.0); // 5.0 * 0.8 (overload penalty)
  });

  it('should clamp price to min/max bounds', () => {
    const pricing2 = new SupplyDemandPricing(5.0, 3.0, 8.0);
    const zone = createZone();
    const lowPrice = pricing2.calculatePrice(zone, 300, 100); // ratio = 3.0
    expect(lowPrice).toBe(3.5); // 5.0 * 0.7 = 3.5, above min of 3.0

    const highPrice = pricing2.calculatePrice(zone, 10, 100); // ratio = 0.1
    expect(highPrice).toBe(7.5); // 5.0 * 1.5 = 7.5, below max of 8.0
  });

  it('should handle zero demand with positive supply', () => {
    const zone = createZone();
    const price = pricing.calculatePrice(zone, 100, 0); // ratio = 2.0 (default)
    expect(price).toBe(3.5); // 5.0 * 0.7
  });
});

describe('TimeOfDayPricing', () => {
  const pricing = new TimeOfDayPricing(5.0);

  it('should have the correct name', () => {
    expect(pricing.name).toBe('TimeOfDay');
  });

  it('should return a positive price', () => {
    const zone = createZone();
    const price = pricing.calculatePrice(zone, 100, 100);
    expect(price).toBeGreaterThan(0);
  });

  it('should adjust price based on supply/demand ratio', () => {
    const zone = createZone();
    const highSupplyPrice = pricing.calculatePrice(zone, 200, 100); // ratio 2.0 > 1.2
    const lowSupplyPrice = pricing.calculatePrice(zone, 50, 100);  // ratio 0.5 < 0.8

    // High supply should reduce price, low supply should increase
    expect(highSupplyPrice).toBeLessThan(lowSupplyPrice);
  });
});
