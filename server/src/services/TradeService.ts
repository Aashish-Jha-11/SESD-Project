import { AppDataSource } from '../config/database';
import { Trade } from '../entities/Trade';
import { Order } from '../entities/Order';
import { Escrow } from '../entities/Escrow';
import { TradeStatus, EscrowStatus, OrderType } from '../enums';
import { WalletService } from './WalletService';
import { NotificationService } from './NotificationService';
import { SettlementService } from './SettlementService';

export class TradeService {
  private tradeRepo = AppDataSource.getRepository(Trade);
  private orderRepo = AppDataSource.getRepository(Order);
  private escrowRepo = AppDataSource.getRepository(Escrow);
  private walletService: WalletService;
  private notificationService: NotificationService;
  private settlementService!: SettlementService;

  constructor(walletService: WalletService, notificationService: NotificationService) {
    this.walletService = walletService;
    this.notificationService = notificationService;
  }

  setSettlementService(service: SettlementService): void {
    this.settlementService = service;
  }

  async executeTrade(buyOrder: Order, sellOrder: Order): Promise<Trade> {
    const [actualBuy, actualSell] = buyOrder.isBuyOrder()
      ? [buyOrder, sellOrder]
      : [sellOrder, buyOrder];

    const quantity = Math.min(Number(actualBuy.quantityKwh), Number(actualSell.quantityKwh));
    const price = Number(actualSell.pricePerKwh);
    const totalAmount = quantity * price;

    await this.walletService.holdEscrow(actualBuy.userId, totalAmount);

    const trade = this.tradeRepo.create({
      buyOrderId: actualBuy.id,
      sellOrderId: actualSell.id,
      buyerId: actualBuy.userId,
      sellerId: actualSell.userId,
      quantityKwh: quantity,
      pricePerKwh: price,
      totalAmount,
      gridZoneId: actualBuy.gridZoneId,
      executedAt: new Date(),
    });

    const savedTrade = await this.tradeRepo.save(trade);

    const escrow = this.escrowRepo.create({
      tradeId: savedTrade.id,
      buyerId: actualBuy.userId,
      amount: totalAmount,
    });
    await this.escrowRepo.save(escrow);

    actualBuy.markMatched();
    actualSell.markMatched();
    await this.orderRepo.save([actualBuy, actualSell]);

    this.notificationService.notify({
      type: 'TRADE_MATCHED',
      tradeId: savedTrade.id,
      buyerId: actualBuy.userId,
      sellerId: actualSell.userId,
      data: { trade: savedTrade },
    });

    setTimeout(() => this.simulateDeliveryAndSettle(savedTrade.id), 5000);

    return savedTrade;
  }

  private async simulateDeliveryAndSettle(tradeId: string): Promise<void> {
    try {
      const trade = await this.tradeRepo.findOne({ where: { id: tradeId } });
      if (!trade || trade.status !== TradeStatus.PENDING) return;

      trade.confirmDelivery();
      await this.tradeRepo.save(trade);

      if (this.settlementService) {
        await this.settlementService.processSettlement(trade);
      }
    } catch (error) {
      console.error(`Settlement failed for trade ${tradeId}:`, error);
    }
  }

  async getUserTrades(userId: string): Promise<Trade[]> {
    return this.tradeRepo.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      order: { executedAt: 'DESC' },
    });
  }

  async getTradeById(id: string): Promise<Trade> {
    const trade = await this.tradeRepo.findOne({ where: { id } });
    if (!trade) throw new Error('Trade not found');
    return trade;
  }

  async getAllTrades(): Promise<Trade[]> {
    return this.tradeRepo.find({ order: { executedAt: 'DESC' }, take: 100 });
  }
}
