import { AppDataSource } from '../config/database';
import { PriceAlert } from '../entities/PriceAlert';
import { NotificationService } from './NotificationService';
import { PricingService } from './PricingService';
import { NotificationType } from '../enums';

export class PriceAlertService {
  private alertRepo = AppDataSource.getRepository(PriceAlert);
  private notificationService: NotificationService;
  private pricingService: PricingService;

  constructor(notificationService: NotificationService, pricingService: PricingService) {
    this.notificationService = notificationService;
    this.pricingService = pricingService;
  }

  async createAlert(userId: string, gridZoneId: string, targetPrice: number, direction: string): Promise<PriceAlert> {
    const alert = this.alertRepo.create({ userId, gridZoneId, targetPrice, direction: direction as any });
    return this.alertRepo.save(alert);
  }

  async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    return this.alertRepo.find({
      where: { userId },
      relations: ['gridZone'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteAlert(id: string, userId: string): Promise<void> {
    const alert = await this.alertRepo.findOne({ where: { id, userId } });
    if (!alert) throw new Error('Alert not found');
    await this.alertRepo.remove(alert);
  }

  async deactivateAlert(id: string, userId: string): Promise<PriceAlert> {
    const alert = await this.alertRepo.findOne({ where: { id, userId } });
    if (!alert) throw new Error('Alert not found');
    alert.deactivate();
    return this.alertRepo.save(alert);
  }

  async evaluateAlerts(gridZoneId: string): Promise<void> {
    const currentPrice = await this.pricingService.getCurrentPrice(gridZoneId);
    const activeAlerts = await this.alertRepo.find({
      where: { gridZoneId, isActive: true },
    });

    for (const alert of activeAlerts) {
      if (alert.evaluate(currentPrice)) {
        this.notificationService.notify({
          type: NotificationType.PRICE_ALERT,
          userId: alert.userId,
          title: 'Price Alert Triggered',
          message: `Price in your watched zone is now $${currentPrice.toFixed(4)}/kWh (target: ${alert.direction} $${Number(alert.targetPrice).toFixed(4)})`,
        });

        alert.deactivate();
        await this.alertRepo.save(alert);
      }
    }
  }
}
