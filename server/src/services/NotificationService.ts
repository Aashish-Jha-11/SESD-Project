import { INotificationObserver, TradeEvent } from '../patterns/observer/INotificationObserver';
import { AppDataSource } from '../config/database';
import { Notification } from '../entities/Notification';
import { NotificationType } from '../enums';

export class NotificationService {
  private observers: INotificationObserver[] = [];

  subscribe(observer: INotificationObserver): void {
    this.observers.push(observer);
  }

  notify(event: TradeEvent): void {
    for (const observer of this.observers) {
      observer.onEvent(event);
    }
  }

  async getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    const repo = AppDataSource.getRepository(Notification);
    return repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    const repo = AppDataSource.getRepository(Notification);
    const notification = await repo.findOne({ where: { id: notificationId } });
    if (notification) {
      notification.markAsRead();
      await repo.save(notification);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const repo = AppDataSource.getRepository(Notification);
    await repo.update({ userId, isRead: false }, { isRead: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    const repo = AppDataSource.getRepository(Notification);
    return repo.count({ where: { userId, isRead: false } });
  }
}
