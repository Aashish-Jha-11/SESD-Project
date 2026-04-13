import 'reflect-metadata';
import { Order } from '../../src/entities/Order';
import { Trade } from '../../src/entities/Trade';
import { Wallet } from '../../src/entities/Wallet';
import { GridZone } from '../../src/entities/GridZone';
import { PriceAlert } from '../../src/entities/PriceAlert';
import { OrderType, OrderStatus, TradeStatus, ZoneStatus, AlertDirection } from '../../src/enums';

describe('Order Entity', () => {
  let order: Order;

  beforeEach(() => {
    order = new Order();
    order.status = OrderStatus.ACTIVE;
    order.type = OrderType.BUY;
    order.quantityKwh = 10;
    order.pricePerKwh = 5.0;
    order.timeWindowEnd = new Date(Date.now() + 3600000);
  });

  it('should cancel an active order', () => {
    order.cancel();
    expect(order.status).toBe(OrderStatus.CANCELLED);
  });

  it('should throw when cancelling non-active order', () => {
    order.status = OrderStatus.MATCHED;
    expect(() => order.cancel()).toThrow('Cannot cancel');
  });

  it('should mark an active order as matched', () => {
    order.markMatched();
    expect(order.status).toBe(OrderStatus.MATCHED);
  });

  it('should throw when matching non-active order', () => {
    order.status = OrderStatus.CANCELLED;
    expect(() => order.markMatched()).toThrow('Cannot match');
  });

  it('should detect active status correctly', () => {
    expect(order.isActive()).toBe(true);
  });

  it('should detect expired orders', () => {
    order.timeWindowEnd = new Date(Date.now() - 1000);
    expect(order.isExpired()).toBe(true);
    expect(order.isActive()).toBe(false);
  });

  it('should identify buy/sell orders', () => {
    expect(order.isBuyOrder()).toBe(true);
    expect(order.isSellOrder()).toBe(false);
  });

  it('should calculate total value', () => {
    expect(order.getTotalValue()).toBe(50);
  });
});

describe('Trade Entity', () => {
  let trade: Trade;

  beforeEach(() => {
    trade = new Trade();
    trade.status = TradeStatus.PENDING;
    trade.totalAmount = 100;
  });

  it('should confirm delivery for pending trade', () => {
    trade.confirmDelivery();
    expect(trade.status).toBe(TradeStatus.DELIVERED);
  });

  it('should throw when confirming delivery on non-pending trade', () => {
    trade.status = TradeStatus.SETTLED;
    expect(() => trade.confirmDelivery()).toThrow('Cannot confirm delivery');
  });

  it('should settle a delivered trade', () => {
    trade.status = TradeStatus.DELIVERED;
    trade.markSettled();
    expect(trade.status).toBe(TradeStatus.SETTLED);
  });

  it('should dispute a pending trade', () => {
    trade.dispute();
    expect(trade.status).toBe(TradeStatus.DISPUTED);
  });

  it('should calculate platform fee', () => {
    expect(trade.getPlatformFee()).toBe(2);
  });

  it('should calculate total with fee', () => {
    expect(trade.getTotalWithFee()).toBe(102);
  });
});

describe('Wallet Entity', () => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet();
    wallet.balance = 1000;
    wallet.escrowBalance = 0;
  });

  it('should credit funds', () => {
    wallet.credit(500);
    expect(wallet.getAvailableBalance()).toBe(1500);
  });

  it('should throw on zero credit', () => {
    expect(() => wallet.credit(0)).toThrow('positive');
  });

  it('should debit funds', () => {
    wallet.debit(300);
    expect(wallet.getAvailableBalance()).toBe(700);
  });

  it('should throw on insufficient balance for debit', () => {
    expect(() => wallet.debit(2000)).toThrow('Insufficient balance');
  });

  it('should hold escrow', () => {
    wallet.holdEscrow(200);
    expect(wallet.getAvailableBalance()).toBe(800);
    expect(Number(wallet.escrowBalance)).toBe(200);
    expect(wallet.getTotalBalance()).toBe(1000);
  });

  it('should release escrow', () => {
    wallet.holdEscrow(200);
    wallet.releaseEscrow(200);
    expect(Number(wallet.escrowBalance)).toBe(0);
  });

  it('should throw on insufficient escrow for release', () => {
    expect(() => wallet.releaseEscrow(100)).toThrow('Insufficient escrow');
  });
});

describe('GridZone Entity', () => {
  let zone: GridZone;

  beforeEach(() => {
    zone = new GridZone();
    zone.maxCapacityKw = 5000;
    zone.currentLoadKw = 2000;
    zone.status = ZoneStatus.ACTIVE;
  });

  it('should calculate load percentage', () => {
    expect(zone.getLoadPercentage()).toBe(40);
  });

  it('should detect non-overloaded zone', () => {
    expect(zone.isOverloaded()).toBe(false);
  });

  it('should detect overloaded zone', () => {
    zone.currentLoadKw = 5000;
    expect(zone.isOverloaded()).toBe(true);
  });

  it('should halt zone', () => {
    zone.halt();
    expect(zone.status).toBe(ZoneStatus.HALTED);
    expect(zone.isActive()).toBe(false);
  });

  it('should resume zone', () => {
    zone.halt();
    zone.resume();
    expect(zone.status).toBe(ZoneStatus.ACTIVE);
    expect(zone.isActive()).toBe(true);
  });

  it('should handle zero capacity', () => {
    zone.maxCapacityKw = 0;
    expect(zone.getLoadPercentage()).toBe(0);
  });
});

describe('PriceAlert Entity', () => {
  let alert: PriceAlert;

  beforeEach(() => {
    alert = new PriceAlert();
    alert.targetPrice = 5.0;
    alert.isActive = true;
  });

  it('should trigger ABOVE alert when current price meets target', () => {
    alert.direction = AlertDirection.ABOVE;
    expect(alert.evaluate(6.0)).toBe(true);
    expect(alert.evaluate(5.0)).toBe(true);
    expect(alert.evaluate(4.0)).toBe(false);
  });

  it('should trigger BELOW alert when current price meets target', () => {
    alert.direction = AlertDirection.BELOW;
    expect(alert.evaluate(4.0)).toBe(true);
    expect(alert.evaluate(5.0)).toBe(true);
    expect(alert.evaluate(6.0)).toBe(false);
  });

  it('should not trigger inactive alert', () => {
    alert.direction = AlertDirection.ABOVE;
    alert.isActive = false;
    expect(alert.evaluate(10.0)).toBe(false);
  });

  it('should deactivate alert', () => {
    alert.deactivate();
    expect(alert.isActive).toBe(false);
  });
});
