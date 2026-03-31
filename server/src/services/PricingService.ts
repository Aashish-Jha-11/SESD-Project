import { IPricingStrategy } from '../patterns/pricing/IPricingStrategy';
import { SupplyDemandPricing } from '../patterns/pricing/SupplyDemandPricing';
import { GridZoneService } from './GridZoneService';
import { AppDataSource } from '../config/database';
import { PriceHistory } from '../entities/PriceHistory';
import { Order } from '../entities/Order';
import { OrderType, OrderStatus } from '../enums';

export class PricingService {
  private strategy: IPricingStrategy;
  private gridZoneService: GridZoneService;
  private priceCache: Map<string, number> = new Map();

  constructor(gridZoneService: GridZoneService, strategy?: IPricingStrategy) {
    this.gridZoneService = gridZoneService;
    this.strategy = strategy || new SupplyDemandPricing();
  }

  setStrategy(strategy: IPricingStrategy): void {
    this.strategy = strategy;
  }

  async getCurrentPrice(zoneId: string): Promise<number> {
    const cached = this.priceCache.get(zoneId);
    if (cached) return cached;

    const zone = await this.gridZoneService.getById(zoneId);
    const orderRepo = AppDataSource.getRepository(Order);

    const [supplyOrders, demandOrders] = await Promise.all([
      orderRepo.find({ where: { gridZoneId: zoneId, type: OrderType.SELL, status: OrderStatus.ACTIVE } }),
      orderRepo.find({ where: { gridZoneId: zoneId, type: OrderType.BUY, status: OrderStatus.ACTIVE } }),
    ]);

    const supply = supplyOrders.reduce((sum, o) => sum + Number(o.quantityKwh), 0);
    const demand = demandOrders.reduce((sum, o) => sum + Number(o.quantityKwh), 0);

    const price = this.strategy.calculatePrice(zone, supply, demand);
    this.priceCache.set(zoneId, price);

    return price;
  }

  async updatePrice(zoneId: string, tradePrice: number): Promise<void> {
    this.priceCache.set(zoneId, tradePrice);

    const historyRepo = AppDataSource.getRepository(PriceHistory);
    const history = historyRepo.create({
      gridZoneId: zoneId,
      pricePerKwh: tradePrice,
      recordedAt: new Date(),
    });
    await historyRepo.save(history);
  }

  async getPriceHistory(zoneId: string, limit = 50): Promise<PriceHistory[]> {
    const repo = AppDataSource.getRepository(PriceHistory);
    return repo.find({
      where: { gridZoneId: zoneId },
      order: { recordedAt: 'DESC' },
      take: limit,
    });
  }
}
