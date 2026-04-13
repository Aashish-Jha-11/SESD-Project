import { AppDataSource } from '../config/database';
import { Trade } from '../entities/Trade';
import { Order } from '../entities/Order';
import { Settlement } from '../entities/Settlement';
import { CarbonCredit } from '../entities/CarbonCredit';
import { EnergyReading } from '../entities/EnergyReading';
import { PriceHistory } from '../entities/PriceHistory';
import { User } from '../entities/User';
import { TradeStatus, OrderType, SettlementStatus } from '../enums';

export class AnalyticsService {
  private tradeRepo = AppDataSource.getRepository(Trade);
  private orderRepo = AppDataSource.getRepository(Order);
  private settlementRepo = AppDataSource.getRepository(Settlement);
  private carbonRepo = AppDataSource.getRepository(CarbonCredit);
  private readingRepo = AppDataSource.getRepository(EnergyReading);
  private priceRepo = AppDataSource.getRepository(PriceHistory);
  private userRepo = AppDataSource.getRepository(User);

  async getPlatformStats() {
    const [totalTrades, settledTrades, totalUsers, totalOrders] = await Promise.all([
      this.tradeRepo.count(),
      this.tradeRepo.count({ where: { status: TradeStatus.SETTLED } }),
      this.userRepo.count(),
      this.orderRepo.count(),
    ]);

    const settlements = await this.settlementRepo.find({
      where: { status: SettlementStatus.COMPLETED },
    });
    const totalRevenue = settlements.reduce((sum, s) => sum + Number(s.platformFee), 0);
    const totalVolume = settlements.reduce((sum, s) => sum + Number(s.sellerAmount) + Number(s.platformFee), 0);

    const carbonCredits = await this.carbonRepo.find();
    const totalCarbonKwh = carbonCredits.reduce((sum, c) => sum + Number(c.kwhGenerated), 0);

    return {
      totalTrades,
      settledTrades,
      totalUsers,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalVolume: Math.round(totalVolume * 100) / 100,
      totalCarbonKwh: Math.round(totalCarbonKwh * 100) / 100,
      co2OffsetKg: Math.round(totalCarbonKwh * 0.4 * 100) / 100,
    };
  }

  async getUserAnalytics(userId: string) {
    const trades = await this.tradeRepo.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      order: { executedAt: 'DESC' },
    });

    const buyTrades = trades.filter((t) => t.buyerId === userId);
    const sellTrades = trades.filter((t) => t.sellerId === userId);

    const totalBought = buyTrades.reduce((sum, t) => sum + Number(t.quantityKwh), 0);
    const totalSold = sellTrades.reduce((sum, t) => sum + Number(t.quantityKwh), 0);
    const totalSpent = buyTrades.reduce((sum, t) => sum + Number(t.totalAmount), 0);
    const totalEarned = sellTrades.reduce((sum, t) => sum + Number(t.totalAmount), 0);

    const carbonCredits = await this.carbonRepo.find({ where: { prosumerId: userId } });
    const totalCarbonKwh = carbonCredits.reduce((sum, c) => sum + Number(c.kwhGenerated), 0);

    // Monthly breakdown (last 6 months)
    const monthlyData = this.aggregateMonthly(trades, userId);

    return {
      totalTrades: trades.length,
      totalBoughtKwh: Math.round(totalBought * 100) / 100,
      totalSoldKwh: Math.round(totalSold * 100) / 100,
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalEarned: Math.round(totalEarned * 100) / 100,
      netEarnings: Math.round((totalEarned - totalSpent) * 100) / 100,
      carbonCreditsKwh: Math.round(totalCarbonKwh * 100) / 100,
      co2OffsetKg: Math.round(totalCarbonKwh * 0.4 * 100) / 100,
      monthlyData,
    };
  }

  async getEnergyTrends(zoneId?: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const queryBuilder = this.readingRepo.createQueryBuilder('r')
      .where('r.recorded_at >= :since', { since: since.toISOString() })
      .orderBy('r.recorded_at', 'ASC');

    if (zoneId) {
      queryBuilder
        .innerJoin('smart_meters', 'm', 'm.id = r.meter_id')
        .andWhere('m.grid_zone_id = :zoneId', { zoneId });
    }

    const readings = await queryBuilder.getMany();

    const hourlyAggregation = new Map<string, { production: number; consumption: number; count: number }>();

    for (const r of readings) {
      const hour = new Date(r.recordedAt).toISOString().slice(0, 13);
      const existing = hourlyAggregation.get(hour) || { production: 0, consumption: 0, count: 0 };
      existing.production += Number(r.productionKwh);
      existing.consumption += Number(r.consumptionKwh);
      existing.count += 1;
      hourlyAggregation.set(hour, existing);
    }

    return Array.from(hourlyAggregation.entries()).map(([hour, data]) => ({
      hour,
      production: Math.round(data.production * 100) / 100,
      consumption: Math.round(data.consumption * 100) / 100,
      net: Math.round((data.production - data.consumption) * 100) / 100,
    }));
  }

  async getPriceTrends(zoneId: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const history = await this.priceRepo.find({
      where: { gridZoneId: zoneId },
      order: { recordedAt: 'ASC' },
      take: days * 24,
    });

    return history.map((h) => ({
      timestamp: h.recordedAt,
      price: Number(h.pricePerKwh),
      supply: Number(h.supplyKwh),
      demand: Number(h.demandKwh),
    }));
  }

  async getLeaderboard(limit = 10) {
    const credits = await this.carbonRepo.find({
      relations: ['prosumer'],
    });

    const userTotals = new Map<string, { name: string; email: string; totalKwh: number }>();

    for (const credit of credits) {
      const existing = userTotals.get(credit.prosumerId) || {
        name: credit.prosumer?.name || 'Unknown',
        email: credit.prosumer?.email || '',
        totalKwh: 0,
      };
      existing.totalKwh += Number(credit.kwhGenerated);
      userTotals.set(credit.prosumerId, existing);
    }

    return Array.from(userTotals.entries())
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        totalKwh: Math.round(data.totalKwh * 100) / 100,
        co2OffsetKg: Math.round(data.totalKwh * 0.4 * 100) / 100,
      }))
      .sort((a, b) => b.totalKwh - a.totalKwh)
      .slice(0, limit);
  }

  private aggregateMonthly(trades: Trade[], userId: string) {
    const months = new Map<string, { bought: number; sold: number; spent: number; earned: number }>();

    for (const trade of trades) {
      const month = new Date(trade.executedAt).toISOString().slice(0, 7);
      const entry = months.get(month) || { bought: 0, sold: 0, spent: 0, earned: 0 };

      if (trade.buyerId === userId) {
        entry.bought += Number(trade.quantityKwh);
        entry.spent += Number(trade.totalAmount);
      }
      if (trade.sellerId === userId) {
        entry.sold += Number(trade.quantityKwh);
        entry.earned += Number(trade.totalAmount);
      }
      months.set(month, entry);
    }

    return Array.from(months.entries())
      .map(([month, data]) => ({
        month,
        boughtKwh: Math.round(data.bought * 100) / 100,
        soldKwh: Math.round(data.sold * 100) / 100,
        spent: Math.round(data.spent * 100) / 100,
        earned: Math.round(data.earned * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
