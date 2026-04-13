import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PriceAlertService } from '../services/PriceAlertService';

export class PriceAlertController {
  private priceAlertService: PriceAlertService;
  public router = Router();

  constructor(priceAlertService: PriceAlertService) {
    this.priceAlertService = priceAlertService;
    this.router.get('/', this.getMyAlerts.bind(this));
    this.router.post('/', this.createAlert.bind(this));
    this.router.put('/:id/deactivate', this.deactivateAlert.bind(this));
    this.router.delete('/:id', this.deleteAlert.bind(this));
  }

  private async getMyAlerts(req: AuthRequest, res: Response) {
    try {
      const alerts = await this.priceAlertService.getUserAlerts(req.user!.userId);
      res.json(alerts);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async createAlert(req: AuthRequest, res: Response) {
    try {
      const { gridZoneId, targetPrice, direction } = req.body;
      const alert = await this.priceAlertService.createAlert(
        req.user!.userId, gridZoneId, targetPrice, direction,
      );
      res.status(201).json(alert);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async deactivateAlert(req: AuthRequest, res: Response) {
    try {
      const alert = await this.priceAlertService.deactivateAlert(req.params.id, req.user!.userId);
      res.json(alert);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async deleteAlert(req: AuthRequest, res: Response) {
    try {
      await this.priceAlertService.deleteAlert(req.params.id, req.user!.userId);
      res.json({ message: 'Alert deleted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
