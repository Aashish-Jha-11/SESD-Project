import { AppDataSource } from '../config/database';
import { Trade } from '../entities/Trade';
import { Settlement } from '../entities/Settlement';
import { CarbonCredit } from '../entities/CarbonCredit';
import { Escrow } from '../entities/Escrow';
import { WalletService } from './WalletService';
import { NotificationService } from './NotificationService';
import { PricingService } from './PricingService';
import { v4 as uuidv4 } from 'uuid';

export class SettlementService {
  private settlementRepo = AppDataSource.getRepository(Settlement);
  private carbonCreditRepo = AppDataSource.getRepository(CarbonCredit);
  private escrowRepo = AppDataSource.getRepository(Escrow);
  private walletService: WalletService;
  private notificationService: NotificationService;
  private pricingService: PricingService;
  private readonly platformFeePercent = 2;

  constructor(
    walletService: WalletService,
    notificationService: NotificationService,
    pricingService: PricingService
  ) {
    this.walletService = walletService;
    this.notificationService = notificationService;
    this.pricingService = pricingService;
  }

  async processSettlement(trade: Trade): Promise<Settlement> {
    const amounts = this.calculateAmounts(trade);
    await this.transferFunds(trade, amounts);
    const carbonCredit = await this.issueCarbonCredits(trade);
    await this.releaseEscrow(trade);

    const settlement = this.settlementRepo.create({
      tradeId: trade.id,
      sellerAmount: amounts.sellerAmount,
      platformFee: amounts.platformFee,
      carbonCreditsIssued: Number(trade.quantityKwh),
    });
    settlement.complete();

    const saved = await this.settlementRepo.save(settlement);

    trade.markSettled();
    await AppDataSource.getRepository(Trade).save(trade);

    await this.pricingService.updatePrice(trade.gridZoneId, Number(trade.pricePerKwh));

    this.notificationService.notify({
      type: 'TRADE_SETTLED',
      tradeId: trade.id,
      buyerId: trade.buyerId,
      sellerId: trade.sellerId,
      data: { settlement: saved, carbonCredit },
    });

    return saved;
  }

  protected calculateAmounts(trade: Trade): { sellerAmount: number; platformFee: number } {
    const total = Number(trade.totalAmount);
    const platformFee = total * (this.platformFeePercent / 100);
    const sellerAmount = total - platformFee;
    return { sellerAmount: Number(sellerAmount.toFixed(2)), platformFee: Number(platformFee.toFixed(2)) };
  }

  protected async transferFunds(
    trade: Trade,
    amounts: { sellerAmount: number; platformFee: number }
  ): Promise<void> {
    await this.walletService.releaseEscrow(trade.buyerId, Number(trade.totalAmount));
    await this.walletService.credit(trade.sellerId, amounts.sellerAmount);
  }

  protected async issueCarbonCredits(trade: Trade): Promise<CarbonCredit> {
    const credit = this.carbonCreditRepo.create({
      prosumerId: trade.sellerId,
      tradeId: trade.id,
      kwhGenerated: Number(trade.quantityKwh),
      certificateHash: `GC-${uuidv4().substring(0, 8).toUpperCase()}`,
      issuedAt: new Date(),
    });
    return this.carbonCreditRepo.save(credit);
  }

  private async releaseEscrow(trade: Trade): Promise<void> {
    const escrow = await this.escrowRepo.findOne({ where: { tradeId: trade.id } });
    if (escrow) {
      escrow.release();
      await this.escrowRepo.save(escrow);
    }
  }

  async getSettlementByTradeId(tradeId: string): Promise<Settlement | null> {
    return this.settlementRepo.findOne({ where: { tradeId } });
  }
}
