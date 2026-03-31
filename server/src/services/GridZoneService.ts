import { AppDataSource } from '../config/database';
import { GridZone } from '../entities/GridZone';
import { ZoneStatus } from '../enums';

export class GridZoneService {
  private zoneRepo = AppDataSource.getRepository(GridZone);

  async getAll(): Promise<GridZone[]> {
    return this.zoneRepo.find();
  }

  async getById(id: string): Promise<GridZone> {
    const zone = await this.zoneRepo.findOne({ where: { id } });
    if (!zone) throw new Error('Grid zone not found');
    return zone;
  }

  async create(name: string, maxCapacityKw: number): Promise<GridZone> {
    const zone = this.zoneRepo.create({ name, maxCapacityKw, currentLoadKw: 0 });
    return this.zoneRepo.save(zone);
  }

  async haltZone(id: string): Promise<GridZone> {
    const zone = await this.getById(id);
    zone.halt();
    return this.zoneRepo.save(zone);
  }

  async resumeZone(id: string): Promise<GridZone> {
    const zone = await this.getById(id);
    zone.resume();
    return this.zoneRepo.save(zone);
  }

  async updateLoad(id: string, loadKw: number): Promise<GridZone> {
    const zone = await this.getById(id);
    zone.currentLoadKw = loadKw;
    return this.zoneRepo.save(zone);
  }

  async getZoneStats(id: string) {
    const zone = await this.getById(id);
    return {
      id: zone.id,
      name: zone.name,
      status: zone.status,
      currentLoadKw: Number(zone.currentLoadKw),
      maxCapacityKw: Number(zone.maxCapacityKw),
      loadPercentage: zone.getLoadPercentage(),
      isOverloaded: zone.isOverloaded(),
    };
  }
}
