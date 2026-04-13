import 'reflect-metadata';
import { WebSocketObserver } from '../../src/patterns/observer/WebSocketObserver';
import { INotificationObserver, TradeEvent } from '../../src/patterns/observer/INotificationObserver';
import { NotificationType } from '../../src/enums';

class MockObserver implements INotificationObserver {
  events: TradeEvent[] = [];

  onEvent(event: TradeEvent): void {
    this.events.push(event);
  }
}

describe('Observer Pattern', () => {
  it('should notify all subscribers', () => {
    const observers: INotificationObserver[] = [];
    const mock1 = new MockObserver();
    const mock2 = new MockObserver();
    observers.push(mock1, mock2);

    const event: TradeEvent = {
      type: NotificationType.TRADE_MATCHED,
      userId: 'user-1',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
    };

    for (const obs of observers) {
      obs.onEvent(event);
    }

    expect(mock1.events).toHaveLength(1);
    expect(mock2.events).toHaveLength(1);
    expect(mock1.events[0].type).toBe(NotificationType.TRADE_MATCHED);
  });

  it('should handle events with partial data', () => {
    const mock = new MockObserver();
    const event: TradeEvent = {
      type: 'PRICE_ALERT',
      userId: 'user-1',
    };

    mock.onEvent(event);
    expect(mock.events).toHaveLength(1);
    expect(mock.events[0].buyerId).toBeUndefined();
  });
});

describe('WebSocketObserver', () => {
  it('should not throw when socket server is not set', () => {
    const observer = new WebSocketObserver();
    const event: TradeEvent = {
      type: NotificationType.TRADE_MATCHED,
      userId: 'user-1',
    };

    expect(() => observer.onEvent(event)).not.toThrow();
  });

  it('should emit to correct rooms when socket server is set', () => {
    const observer = new WebSocketObserver();
    const toMock = jest.fn().mockReturnValue({ emit: jest.fn() });
    const emitMock = jest.fn();

    const fakeIo = {
      to: toMock,
      emit: emitMock,
    };

    observer.setSocketServer(fakeIo as any);

    const event: TradeEvent = {
      type: NotificationType.TRADE_MATCHED,
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
    };

    observer.onEvent(event);

    expect(toMock).toHaveBeenCalledWith('user:buyer-1');
    expect(toMock).toHaveBeenCalledWith('user:seller-1');
  });
});
