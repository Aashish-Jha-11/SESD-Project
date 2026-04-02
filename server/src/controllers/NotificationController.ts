import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
  private notificationService: NotificationService;
  public router = Router();

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/unread-count', this.getUnreadCount.bind(this));
    this.router.put('/:id/read', this.markAsRead.bind(this));
    this.router.put('/read-all', this.markAllAsRead.bind(this));
  }

  private async getAll(req: AuthRequest, res: Response) {
    try {
      const notifications = await this.notificationService.getUserNotifications(req.user!.userId);
      res.json(notifications);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const count = await this.notificationService.getUnreadCount(req.user!.userId);
      res.json({ count });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async markAsRead(req: AuthRequest, res: Response) {
    try {
      await this.notificationService.markAsRead(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      await this.notificationService.markAllAsRead(req.user!.userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
