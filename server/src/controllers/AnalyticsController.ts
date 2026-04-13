import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AnalyticsService } from '../services/AnalyticsService';

export class AnalyticsController {
  private analyticsService: AnalyticsService;
  public router = Router();

  constructor(analyticsService: AnalyticsService) {
    this.analyticsService = analyticsService;
    this.router.get('/platform', this.getPlatformStats.bind(this));
    this.router.get('/me', this.getUserAnalytics.bind(this));
    this.router.get('/energy-trends', this.getEnergyTrends.bind(this));
    this.router.get('/price-trends/:zoneId', this.getPriceTrends.bind(this));
    this.router.get('/leaderboard', this.getLeaderboard.bind(this));
  }

  private async getPlatformStats(_req: AuthRequest, res: Response) {
    try {
      const stats = await this.analyticsService.getPlatformStats();
      res.json(stats);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getUserAnalytics(req: AuthRequest, res: Response) {
    try {
      const analytics = await this.analyticsService.getUserAnalytics(req.user!.userId);
      res.json(analytics);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getEnergyTrends(req: AuthRequest, res: Response) {
    try {
      const zoneId = req.query.zoneId as string | undefined;
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const trends = await this.analyticsService.getEnergyTrends(zoneId, days);
      res.json(trends);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getPriceTrends(req: AuthRequest, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const trends = await this.analyticsService.getPriceTrends(req.params.zoneId, days);
      res.json(trends);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getLeaderboard(req: AuthRequest, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const leaderboard = await this.analyticsService.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
