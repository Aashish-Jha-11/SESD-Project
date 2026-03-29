import { INotificationObserver, TradeEvent } from './INotificationObserver';
import { Server as SocketServer } from 'socket.io';

export class WebSocketObserver implements INotificationObserver {
  private io: SocketServer | null = null;

  setSocketServer(io: SocketServer): void {
    this.io = io;
  }

  onEvent(event: TradeEvent): void {
    if (!this.io) return;

    if (event.buyerId) {
      this.io.to(`user:${event.buyerId}`).emit('notification', event);
    }
    if (event.sellerId) {
      this.io.to(`user:${event.sellerId}`).emit('notification', event);
    }
    if (event.userId) {
      this.io.to(`user:${event.userId}`).emit('notification', event);
    }

    if (event.type === 'ORDER_BOOK_UPDATE') {
      this.io.emit('orderBookUpdate', event.data);
    }
    if (event.type === 'PRICE_UPDATE') {
      this.io.emit('priceUpdate', event.data);
    }
  }
}
