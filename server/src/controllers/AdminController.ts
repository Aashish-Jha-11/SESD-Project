import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AuditLogService } from '../services/AuditLogService';

export class AdminController {
  private userRepo = AppDataSource.getRepository(User);
  private auditLogService: AuditLogService;
  public router = Router();

  constructor(auditLogService: AuditLogService) {
    this.auditLogService = auditLogService;
    this.router.get('/users', this.getAllUsers.bind(this));
    this.router.put('/users/:id/deactivate', this.deactivateUser.bind(this));
    this.router.put('/users/:id/activate', this.activateUser.bind(this));
    this.router.get('/audit-logs', this.getAuditLogs.bind(this));
    this.router.get('/stats', this.getStats.bind(this));
  }

  private async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const users = await this.userRepo.find({ select: ['id', 'email', 'name', 'role', 'isActive', 'createdAt'] });
      res.json(users);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async deactivateUser(req: AuthRequest, res: Response) {
    try {
      const user = await this.userRepo.findOne({ where: { id: req.params.id } });
      if (!user) { res.status(404).json({ error: 'User not found' }); return; }
      user.deactivate();
      await this.userRepo.save(user);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async activateUser(req: AuthRequest, res: Response) {
    try {
      const user = await this.userRepo.findOne({ where: { id: req.params.id } });
      if (!user) { res.status(404).json({ error: 'User not found' }); return; }
      user.activate();
      await this.userRepo.save(user);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await this.auditLogService.getRecent(100);
      res.json(logs);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getStats(req: AuthRequest, res: Response) {
    try {
      const userCount = await this.userRepo.count();
      const activeUsers = await this.userRepo.count({ where: { isActive: true } });
      res.json({ totalUsers: userCount, activeUsers });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
