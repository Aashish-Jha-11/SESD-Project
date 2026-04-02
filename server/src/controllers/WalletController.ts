import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { WalletService } from '../services/WalletService';

export class WalletController {
  private walletService: WalletService;
  public router = Router();

  constructor(walletService: WalletService) {
    this.walletService = walletService;
    this.router.get('/', this.getBalance.bind(this));
    this.router.post('/add-funds', this.addFunds.bind(this));
  }

  private async getBalance(req: AuthRequest, res: Response) {
    try {
      const balance = await this.walletService.getBalance(req.user!.userId);
      res.json(balance);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async addFunds(req: AuthRequest, res: Response) {
    try {
      const { amount } = req.body;
      const wallet = await this.walletService.addFunds(req.user!.userId, amount);
      res.json({ balance: wallet.getAvailableBalance(), escrow: Number(wallet.escrowBalance) });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
