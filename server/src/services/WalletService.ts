import { AppDataSource } from '../config/database';
import { Wallet } from '../entities/Wallet';

export class WalletService {
  private walletRepo = AppDataSource.getRepository(Wallet);

  async getByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) throw new Error('Wallet not found');
    return wallet;
  }

  async credit(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getByUserId(userId);
    wallet.credit(amount);
    return this.walletRepo.save(wallet);
  }

  async debit(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getByUserId(userId);
    wallet.debit(amount);
    return this.walletRepo.save(wallet);
  }

  async holdEscrow(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getByUserId(userId);
    wallet.holdEscrow(amount);
    return this.walletRepo.save(wallet);
  }

  async releaseEscrow(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getByUserId(userId);
    wallet.releaseEscrow(amount);
    return this.walletRepo.save(wallet);
  }

  async getBalance(userId: string): Promise<{ balance: number; escrow: number; total: number }> {
    const wallet = await this.getByUserId(userId);
    return {
      balance: wallet.getAvailableBalance(),
      escrow: Number(wallet.escrowBalance),
      total: wallet.getTotalBalance(),
    };
  }

  async addFunds(userId: string, amount: number): Promise<Wallet> {
    return this.credit(userId, amount);
  }
}
