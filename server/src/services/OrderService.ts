import { AppDataSource } from '../config/database';
import { Order } from '../entities/Order';
import { CreateOrderDto } from '../dtos/order.dto';
import { OrderStatus, OrderType, SourceTypeFilter } from '../enums';
import { MatchingEngine } from '../patterns/matching/MatchingEngine';
import { OrderValidator } from '../patterns/validation/OrderValidator';
import { QuantityValidator } from '../patterns/validation/QuantityValidator';
import { PriceRangeValidator } from '../patterns/validation/PriceRangeValidator';
import { TimeWindowValidator } from '../patterns/validation/TimeWindowValidator';
import { ComplianceValidator } from '../patterns/validation/ComplianceValidator';
import { TradeService } from './TradeService';
import { NotificationService } from './NotificationService';

export class OrderService {
  private orderRepo = AppDataSource.getRepository(Order);
  private matchingEngine: MatchingEngine;
  private tradeService: TradeService;
  private notificationService: NotificationService;
  private validationChain: OrderValidator;

  constructor(
    matchingEngine: MatchingEngine,
    tradeService: TradeService,
    notificationService: NotificationService
  ) {
    this.matchingEngine = matchingEngine;
    this.tradeService = tradeService;
    this.notificationService = notificationService;
    this.validationChain = this.buildValidationChain();
  }

  private buildValidationChain(): OrderValidator {
    const quantityValidator = new QuantityValidator();
    const priceValidator = new PriceRangeValidator();
    const timeValidator = new TimeWindowValidator();
    const complianceValidator = new ComplianceValidator();

    quantityValidator.setNext(priceValidator);
    priceValidator.setNext(timeValidator);
    timeValidator.setNext(complianceValidator);

    return quantityValidator;
  }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepo.create({
      userId,
      type: dto.type,
      quantityKwh: dto.quantityKwh,
      pricePerKwh: dto.pricePerKwh,
      gridZoneId: dto.gridZoneId,
      sourceType: dto.sourceType || SourceTypeFilter.ANY,
      timeWindowStart: new Date(dto.timeWindowStart),
      timeWindowEnd: new Date(dto.timeWindowEnd),
    });

    const validationResult = this.validationChain.validate(order);
    if (!validationResult.isValid) {
      throw new Error(validationResult.error);
    }

    const savedOrder = await this.orderRepo.save(order);

    this.notificationService.notify({
      type: 'ORDER_BOOK_UPDATE',
      userId,
      orderId: savedOrder.id,
      data: { action: 'NEW_ORDER', order: savedOrder },
    });

    await this.attemptMatch(savedOrder);

    return savedOrder;
  }

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId, userId } });
    if (!order) throw new Error('Order not found');

    order.cancel();
    const saved = await this.orderRepo.save(order);

    this.notificationService.notify({
      type: 'ORDER_BOOK_UPDATE',
      userId,
      orderId,
      data: { action: 'CANCEL_ORDER', order: saved },
    });

    return saved;
  }

  async getOrderBook(zoneId: string): Promise<{ buyOrders: Order[]; sellOrders: Order[] }> {
    const [buyOrders, sellOrders] = await Promise.all([
      this.orderRepo.find({
        where: { gridZoneId: zoneId, type: OrderType.BUY, status: OrderStatus.ACTIVE },
        order: { pricePerKwh: 'DESC' },
      }),
      this.orderRepo.find({
        where: { gridZoneId: zoneId, type: OrderType.SELL, status: OrderStatus.ACTIVE },
        order: { pricePerKwh: 'ASC' },
      }),
    ]);

    return { buyOrders, sellOrders };
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveOrders(zoneId?: string): Promise<Order[]> {
    const where: any = { status: OrderStatus.ACTIVE };
    if (zoneId) where.gridZoneId = zoneId;
    return this.orderRepo.find({ where });
  }

  private async attemptMatch(order: Order): Promise<void> {
    const counterType = order.isBuyOrder() ? OrderType.SELL : OrderType.BUY;

    const candidates = await this.orderRepo.find({
      where: {
        gridZoneId: order.gridZoneId,
        type: counterType,
        status: OrderStatus.ACTIVE,
      },
    });

    const match = this.matchingEngine.findMatch(order, candidates);
    if (match) {
      await this.tradeService.executeTrade(order, match);
    }
  }
}
