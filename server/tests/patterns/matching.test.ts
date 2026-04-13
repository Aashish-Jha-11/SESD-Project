import 'reflect-metadata';
import { PriceTimePriorityStrategy } from '../../src/patterns/matching/PriceTimePriorityStrategy';
import { GreenSourceFirstStrategy } from '../../src/patterns/matching/GreenSourceFirstStrategy';
import { ProximityFirstStrategy } from '../../src/patterns/matching/ProximityFirstStrategy';
import { MatchingEngine } from '../../src/patterns/matching/MatchingEngine';
import { Order } from '../../src/entities/Order';
import { OrderType, OrderStatus, SourceTypeFilter } from '../../src/enums';

function createOrder(overrides: Partial<Order> = {}): Order {
  const order = new Order();
  order.id = 'order-1';
  order.userId = 'user-1';
  order.type = OrderType.BUY;
  order.quantityKwh = 10;
  order.pricePerKwh = 5.0;
  order.status = OrderStatus.ACTIVE;
  order.gridZoneId = 'zone-1';
  order.sourceType = SourceTypeFilter.ANY;
  order.timeWindowStart = new Date('2025-01-01T06:00:00');
  order.timeWindowEnd = new Date('2025-01-01T18:00:00');
  order.createdAt = new Date('2025-01-01T00:00:00');
  Object.assign(order, overrides);
  return order;
}

describe('PriceTimePriorityStrategy', () => {
  const strategy = new PriceTimePriorityStrategy();

  it('should have the correct name', () => {
    expect(strategy.name).toBe('PriceTimePriority');
  });

  it('should return null for empty candidates', () => {
    const order = createOrder({ type: OrderType.BUY });
    expect(strategy.match(order, [])).toBeNull();
  });

  it('should match a buy order with the cheapest sell order', () => {
    const buyOrder = createOrder({ id: 'buy-1', type: OrderType.BUY, pricePerKwh: 6.0 });
    const sell1 = createOrder({ id: 'sell-1', type: OrderType.SELL, pricePerKwh: 5.5 });
    const sell2 = createOrder({ id: 'sell-2', type: OrderType.SELL, pricePerKwh: 4.0 });

    const match = strategy.match(buyOrder, [sell1, sell2]);
    expect(match).not.toBeNull();
    expect(match!.id).toBe('sell-2'); // cheapest
  });

  it('should match a sell order with the highest-paying buy order', () => {
    const sellOrder = createOrder({ id: 'sell-1', type: OrderType.SELL, pricePerKwh: 3.0 });
    const buy1 = createOrder({ id: 'buy-1', type: OrderType.BUY, pricePerKwh: 4.0 });
    const buy2 = createOrder({ id: 'buy-2', type: OrderType.BUY, pricePerKwh: 6.0 });

    const match = strategy.match(sellOrder, [buy1, buy2]);
    expect(match).not.toBeNull();
    expect(match!.id).toBe('buy-2'); // highest paying
  });

  it('should not match orders with incompatible prices', () => {
    const buyOrder = createOrder({ id: 'buy-1', type: OrderType.BUY, pricePerKwh: 3.0 });
    const sellOrder = createOrder({ id: 'sell-1', type: OrderType.SELL, pricePerKwh: 5.0 });

    expect(strategy.match(buyOrder, [sellOrder])).toBeNull();
  });

  it('should not match orders with non-overlapping time windows', () => {
    const buyOrder = createOrder({
      id: 'buy-1', type: OrderType.BUY, pricePerKwh: 10.0,
      timeWindowStart: new Date('2025-01-01T06:00:00'),
      timeWindowEnd: new Date('2025-01-01T10:00:00'),
    });
    const sellOrder = createOrder({
      id: 'sell-1', type: OrderType.SELL, pricePerKwh: 3.0,
      timeWindowStart: new Date('2025-01-01T12:00:00'),
      timeWindowEnd: new Date('2025-01-01T18:00:00'),
    });

    expect(strategy.match(buyOrder, [sellOrder])).toBeNull();
  });

  it('should use FIFO ordering for same-priced candidates', () => {
    const buyOrder = createOrder({ id: 'buy-1', type: OrderType.BUY, pricePerKwh: 6.0 });
    const sell1 = createOrder({
      id: 'sell-1', type: OrderType.SELL, pricePerKwh: 4.0,
      createdAt: new Date('2025-01-01T02:00:00'),
    });
    const sell2 = createOrder({
      id: 'sell-2', type: OrderType.SELL, pricePerKwh: 4.0,
      createdAt: new Date('2025-01-01T01:00:00'),
    });

    const match = strategy.match(buyOrder, [sell1, sell2]);
    expect(match!.id).toBe('sell-2'); // earlier created
  });

  it('should not match orders of the same type', () => {
    const buyOrder = createOrder({ id: 'buy-1', type: OrderType.BUY });
    const anotherBuy = createOrder({ id: 'buy-2', type: OrderType.BUY });

    expect(strategy.match(buyOrder, [anotherBuy])).toBeNull();
  });
});

describe('MatchingEngine', () => {
  it('should use PriceTimePriority as default strategy', () => {
    const engine = new MatchingEngine();
    expect(engine.getStrategyName()).toBe('PriceTimePriority');
  });

  it('should allow strategy swap at runtime', () => {
    const engine = new MatchingEngine();
    engine.setStrategy(new GreenSourceFirstStrategy());
    expect(engine.getStrategyName()).toBe('GreenSourceFirst');
  });

  it('should delegate matching to current strategy', () => {
    const engine = new MatchingEngine(new PriceTimePriorityStrategy());
    const buyOrder = createOrder({ id: 'buy-1', type: OrderType.BUY, pricePerKwh: 6.0 });
    const sellOrder = createOrder({ id: 'sell-1', type: OrderType.SELL, pricePerKwh: 4.0 });

    const match = engine.findMatch(buyOrder, [sellOrder]);
    expect(match).not.toBeNull();
    expect(match!.id).toBe('sell-1');
  });

  it('should return null when no candidates', () => {
    const engine = new MatchingEngine();
    const order = createOrder();
    expect(engine.findMatch(order, [])).toBeNull();
  });
});

describe('GreenSourceFirstStrategy', () => {
  const strategy = new GreenSourceFirstStrategy();

  it('should have the correct name', () => {
    expect(strategy.name).toBe('GreenSourceFirst');
  });

  it('should prioritize solar over wind', () => {
    const buyOrder = createOrder({ id: 'buy-1', type: OrderType.BUY, pricePerKwh: 10.0 });
    const windSell = createOrder({ id: 'sell-wind', type: OrderType.SELL, pricePerKwh: 4.0, sourceType: SourceTypeFilter.WIND });
    const solarSell = createOrder({ id: 'sell-solar', type: OrderType.SELL, pricePerKwh: 4.0, sourceType: SourceTypeFilter.SOLAR });

    const match = strategy.match(buyOrder, [windSell, solarSell]);
    expect(match).not.toBeNull();
    expect(match!.id).toBe('sell-solar');
  });
});

describe('ProximityFirstStrategy', () => {
  const strategy = new ProximityFirstStrategy();

  it('should have the correct name', () => {
    expect(strategy.name).toBe('ProximityFirst');
  });

  it('should prefer same-zone orders', () => {
    const buyOrder = createOrder({ id: 'buy-1', type: OrderType.BUY, pricePerKwh: 10.0, gridZoneId: 'zone-A' });
    const sameZoneSell = createOrder({ id: 'sell-1', type: OrderType.SELL, pricePerKwh: 5.0, gridZoneId: 'zone-A' });
    const diffZoneSell = createOrder({ id: 'sell-2', type: OrderType.SELL, pricePerKwh: 3.0, gridZoneId: 'zone-B' });

    const match = strategy.match(buyOrder, [diffZoneSell, sameZoneSell]);
    expect(match).not.toBeNull();
    expect(match!.id).toBe('sell-1');
  });
});
