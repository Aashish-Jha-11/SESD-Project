import { AppDataSource } from '../config/database';
import { AuditLog } from '../entities/AuditLog';

export class AuditLogService {
  private auditRepo = AppDataSource.getRepository(AuditLog);

  async log(userId: string, action: string, entityType: string, entityId: string, details?: object, ipAddress?: string): Promise<void> {
    const entry = this.auditRepo.create({ userId, action, entityType, entityId, details, ipAddress });
    await this.auditRepo.save(entry);
  }

  async getByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async getRecent(limit = 50): Promise<AuditLog[]> {
    return this.auditRepo.find({ order: { createdAt: 'DESC' }, take: limit });
  }

  async getByUser(userId: string, limit = 50): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
