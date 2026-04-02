import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { AppDataSource } from './config/database';
import { authMiddleware } from './middleware/auth';
import { requireRole } from './middleware/rbac';
import { errorHandler } from './middleware/errorHandler';
import { UserRole } from './enums';

import { MatchingEngine } from './patterns/matching/MatchingEngine';
import { PriceTimePriorityStrategy } from './patterns/matching/PriceTimePriorityStrategy';
import { NotificationService } from './services/NotificationService';
import { WebSocketObserver } from './patterns/observer/WebSocketObserver';
import { InAppObserver } from './patterns/observer/InAppObserver';
import { WalletService } from './services/WalletService';
import { GridZoneService } from './services/GridZoneService';
import { PricingService } from './services/PricingService';
import { TradeService } from './services/TradeService';
import { SettlementService } from './services/SettlementService';
import { OrderService } from './services/OrderService';
import { EnergyService } from './services/EnergyService';
import { AuditLogService } from './services/AuditLogService';
import { SocketManager } from './websocket/socketManager';

import { AuthController } from './controllers/AuthController';
import { OrderController } from './controllers/OrderController';
import { TradeController } from './controllers/TradeController';
import { WalletController } from './controllers/WalletController';
import { EnergyController } from './controllers/EnergyController';
import { GridZoneController } from './controllers/GridZoneController';
import { NotificationController } from './controllers/NotificationController';
import { AdminController } from './controllers/AdminController';

import { seedDatabase } from './seed/seed';

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  await AppDataSource.initialize();
  console.log('Database connected');

  await seedDatabase();

  const app = express();
  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json());

  const socketManager = SocketManager.getInstance();
  const io = socketManager.initialize(server);

  const notificationService = new NotificationService();
  const wsObserver = new WebSocketObserver();
  wsObserver.setSocketServer(io);
  notificationService.subscribe(wsObserver);
  notificationService.subscribe(new InAppObserver());

  const walletService = new WalletService();
  const gridZoneService = new GridZoneService();
  const pricingService = new PricingService(gridZoneService);
  const matchingEngine = new MatchingEngine(new PriceTimePriorityStrategy());
  const tradeService = new TradeService(walletService, notificationService);
  const settlementService = new SettlementService(walletService, notificationService, pricingService);
  tradeService.setSettlementService(settlementService);
  const orderService = new OrderService(matchingEngine, tradeService, notificationService);
  const energyService = new EnergyService();
  const auditLogService = new AuditLogService();

  const authController = new AuthController();
  const orderController = new OrderController(orderService);
  const tradeController = new TradeController(tradeService);
  const walletController = new WalletController(walletService);
  const energyController = new EnergyController(energyService);
  const gridZoneController = new GridZoneController(gridZoneService, pricingService);
  const notificationController = new NotificationController(notificationService);
  const adminController = new AdminController(auditLogService);

  app.use('/api/auth', authController.router);
  app.use('/api/orders', authMiddleware, orderController.router);
  app.use('/api/trades', authMiddleware, tradeController.router);
  app.use('/api/wallet', authMiddleware, walletController.router);
  app.use('/api/energy', authMiddleware, energyController.router);
  app.use('/api/zones', authMiddleware, gridZoneController.router);
  app.use('/api/notifications', authMiddleware, notificationController.router);
  app.use('/api/admin', authMiddleware, requireRole(UserRole.ADMIN), adminController.router);

  app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

  app.use(errorHandler);

  server.listen(PORT, () => {
    console.log(`GreenGrid server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch(console.error);
