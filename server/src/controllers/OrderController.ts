import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OrderService } from '../services/OrderService';

export class OrderController {
  private orderService: OrderService;
  public router = Router();

  constructor(orderService: OrderService) {
    this.orderService = orderService;
    this.router.post('/', this.createOrder.bind(this));
    this.router.get('/book/:zoneId', this.getOrderBook.bind(this));
    this.router.get('/my', this.getMyOrders.bind(this));
    this.router.delete('/:id', this.cancelOrder.bind(this));
  }

  private async createOrder(req: AuthRequest, res: Response) {
    try {
      const order = await this.orderService.createOrder(req.user!.userId, req.body);
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getOrderBook(req: AuthRequest, res: Response) {
    try {
      const book = await this.orderService.getOrderBook(req.params.zoneId);
      res.json(book);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getMyOrders(req: AuthRequest, res: Response) {
    try {
      const orders = await this.orderService.getUserOrders(req.user!.userId);
      res.json(orders);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const order = await this.orderService.cancelOrder(req.params.id, req.user!.userId);
      res.json(order);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
