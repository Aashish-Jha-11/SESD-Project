import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TradeService } from '../services/TradeService';

export class TradeController {
  private tradeService: TradeService;
  public router = Router();

  constructor(tradeService: TradeService) {
    this.tradeService = tradeService;
    this.router.get('/my', this.getMyTrades.bind(this));
    this.router.get('/:id', this.getTradeById.bind(this));
    this.router.get('/', this.getAllTrades.bind(this));
  }

  private async getMyTrades(req: AuthRequest, res: Response) {
    try {
      const trades = await this.tradeService.getUserTrades(req.user!.userId);
      res.json(trades);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getTradeById(req: AuthRequest, res: Response) {
    try {
      const trade = await this.tradeService.getTradeById(req.params.id);
      res.json(trade);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getAllTrades(req: AuthRequest, res: Response) {
    try {
      const trades = await this.tradeService.getAllTrades();
      res.json(trades);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
