import { INotificationObserver, TradeEvent } from './INotificationObserver';
import { AppDataSource } from '../../config/database';
import { Notification } from '../../entities/Notification';
import { NotificationType } from '../../enums';

export class InAppObserver implements INotificationObserver {
  private readonly EVENT_TYPE_MAP: Record<string, NotificationType> = {
    TRADE_MATCHED: NotificationType.TRADE_MATCHED,
    TRADE_SETTLED: NotificationType.TRADE_SETTLED,
    PRICE_ALERT: NotificationType.PRICE_ALERT,
    GRID_ALERT: NotificationType.GRID_ALERT,
  };

  async onEvent(event: TradeEvent): Promise<void> {
    const notifType = this.EVENT_TYPE_MAP[event.type] || NotificationType.SYSTEM;
    const userIds = this.extractUserIds(event);

    const repo = AppDataSource.getRepository(Notification);

    for (const userId of userIds) {
      const notification = repo.create({
        userId,
        type: notifType,
        title: this.buildTitle(event),
        message: JSON.stringify(event.data || {}),
      });
      await repo.save(notification);
    }
  }

  private extractUserIds(event: TradeEvent): string[] {
    const ids: string[] = [];
    if (event.userId) ids.push(event.userId);
    if (event.buyerId && !ids.includes(event.buyerId)) ids.push(event.buyerId);
    if (event.sellerId && !ids.includes(event.sellerId)) ids.push(event.sellerId);
    return ids;
  }

  private buildTitle(event: TradeEvent): string {
    switch (event.type) {
      case 'TRADE_MATCHED': return 'Trade Matched!';
      case 'TRADE_SETTLED': return 'Trade Settled';
      case 'PRICE_ALERT': return 'Price Alert Triggered';
      case 'GRID_ALERT': return 'Grid Alert';
      default: return 'System Notification';
    }
  }
}
