import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { GridZoneService } from '../services/GridZoneService';
import { PricingService } from '../services/PricingService';

export class GridZoneController {
  private gridZoneService: GridZoneService;
  private pricingService: PricingService;
  public router = Router();

  constructor(gridZoneService: GridZoneService, pricingService: PricingService) {
    this.gridZoneService = gridZoneService;
    this.pricingService = pricingService;
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.get('/:id/stats', this.getStats.bind(this));
    this.router.get('/:id/price', this.getPrice.bind(this));
    this.router.get('/:id/price-history', this.getPriceHistory.bind(this));
    this.router.post('/', this.create.bind(this));
    this.router.post('/:id/halt', this.halt.bind(this));
    this.router.post('/:id/resume', this.resume.bind(this));
  }

  private async getAll(req: AuthRequest, res: Response) {
    try {
      const zones = await this.gridZoneService.getAll();
      res.json(zones);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getById(req: AuthRequest, res: Response) {
    try {
      const zone = await this.gridZoneService.getById(req.params.id);
      res.json(zone);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getStats(req: AuthRequest, res: Response) {
    try {
      const stats = await this.gridZoneService.getZoneStats(req.params.id);
      res.json(stats);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getPrice(req: AuthRequest, res: Response) {
    try {
      const price = await this.pricingService.getCurrentPrice(req.params.id);
      res.json({ zoneId: req.params.id, pricePerKwh: price });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getPriceHistory(req: AuthRequest, res: Response) {
    try {
      const history = await this.pricingService.getPriceHistory(req.params.id);
      res.json(history);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async create(req: AuthRequest, res: Response) {
    try {
      const zone = await this.gridZoneService.create(req.body.name, req.body.maxCapacityKw);
      res.status(201).json(zone);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async halt(req: AuthRequest, res: Response) {
    try {
      const zone = await this.gridZoneService.haltZone(req.params.id);
      res.json(zone);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async resume(req: AuthRequest, res: Response) {
    try {
      const zone = await this.gridZoneService.resumeZone(req.params.id);
      res.json(zone);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
