export interface TradeEvent {
  type: string;
  tradeId?: string;
  orderId?: string;
  userId?: string;
  buyerId?: string;
  sellerId?: string;
  data?: Record<string, any>;
}

export interface INotificationObserver {
  onEvent(event: TradeEvent): void;
}
