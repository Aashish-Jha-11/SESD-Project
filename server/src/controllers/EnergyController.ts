import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EnergyService } from '../services/EnergyService';

export class EnergyController {
  private energyService: EnergyService;
  public router = Router();

  constructor(energyService: EnergyService) {
    this.energyService = energyService;
    this.router.get('/dashboard', this.getDashboard.bind(this));
    this.router.get('/sources', this.getSources.bind(this));
    this.router.post('/sources', this.addSource.bind(this));
    this.router.get('/meters', this.getMeters.bind(this));
    this.router.post('/meters', this.registerMeter.bind(this));
    this.router.get('/readings/:meterId', this.getReadings.bind(this));
    this.router.post('/readings', this.recordReading.bind(this));
    this.router.get('/carbon-credits', this.getCarbonCredits.bind(this));
  }

  private async getDashboard(req: AuthRequest, res: Response) {
    try {
      const data = await this.energyService.getEnergyDashboard(req.user!.userId);
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getSources(req: AuthRequest, res: Response) {
    try {
      const sources = await this.energyService.getUserEnergySources(req.user!.userId);
      res.json(sources);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async addSource(req: AuthRequest, res: Response) {
    try {
      const source = await this.energyService.addEnergySource(
        req.user!.userId, req.body.type, req.body.capacityKw
      );
      res.status(201).json(source);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getMeters(req: AuthRequest, res: Response) {
    try {
      const meters = await this.energyService.getUserMeters(req.user!.userId);
      res.json(meters);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async registerMeter(req: AuthRequest, res: Response) {
    try {
      const meter = await this.energyService.registerMeter(
        req.user!.userId, req.body.gridZoneId, req.body.serialNumber
      );
      res.status(201).json(meter);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getReadings(req: AuthRequest, res: Response) {
    try {
      const readings = await this.energyService.getReadings(req.params.meterId);
      res.json(readings);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async recordReading(req: AuthRequest, res: Response) {
    try {
      const reading = await this.energyService.recordReading(
        req.body.meterId, req.body.productionKwh, req.body.consumptionKwh
      );
      res.status(201).json(reading);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getCarbonCredits(req: AuthRequest, res: Response) {
    try {
      const credits = await this.energyService.getUserCarbonCredits(req.user!.userId);
      const total = await this.energyService.getTotalCarbonCredits(req.user!.userId);
      res.json({ credits, total });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
