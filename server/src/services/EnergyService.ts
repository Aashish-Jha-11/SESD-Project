import { AppDataSource } from '../config/database';
import { EnergySource } from '../entities/EnergySource';
import { SmartMeter } from '../entities/SmartMeter';
import { EnergyReading } from '../entities/EnergyReading';
import { CarbonCredit } from '../entities/CarbonCredit';
import { EnergySourceType, MeterStatus } from '../enums';

export class EnergyService {
  private sourceRepo = AppDataSource.getRepository(EnergySource);
  private meterRepo = AppDataSource.getRepository(SmartMeter);
  private readingRepo = AppDataSource.getRepository(EnergyReading);
  private carbonCreditRepo = AppDataSource.getRepository(CarbonCredit);

  async addEnergySource(prosumerId: string, type: EnergySourceType, capacityKw: number): Promise<EnergySource> {
    const source = this.sourceRepo.create({ prosumerId, type, capacityKw, installedDate: new Date() });
    return this.sourceRepo.save(source);
  }

  async getUserEnergySources(userId: string): Promise<EnergySource[]> {
    return this.sourceRepo.find({ where: { prosumerId: userId } });
  }

  async registerMeter(userId: string, gridZoneId: string, serialNumber: string): Promise<SmartMeter> {
    const meter = this.meterRepo.create({ userId, gridZoneId, serialNumber });
    return this.meterRepo.save(meter);
  }

  async getUserMeters(userId: string): Promise<SmartMeter[]> {
    return this.meterRepo.find({ where: { userId } });
  }

  async recordReading(meterId: string, productionKwh: number, consumptionKwh: number): Promise<EnergyReading> {
    const reading = this.readingRepo.create({
      meterId,
      productionKwh,
      consumptionKwh,
      netEnergyKwh: productionKwh - consumptionKwh,
      recordedAt: new Date(),
    });
    return this.readingRepo.save(reading);
  }

  async getReadings(meterId: string, limit = 24): Promise<EnergyReading[]> {
    return this.readingRepo.find({
      where: { meterId },
      order: { recordedAt: 'DESC' },
      take: limit,
    });
  }

  async getUserCarbonCredits(userId: string): Promise<CarbonCredit[]> {
    return this.carbonCreditRepo.find({
      where: { prosumerId: userId },
      order: { issuedAt: 'DESC' },
    });
  }

  async getTotalCarbonCredits(userId: string): Promise<number> {
    const credits = await this.carbonCreditRepo.find({ where: { prosumerId: userId } });
    return credits.reduce((sum, c) => sum + Number(c.kwhGenerated), 0);
  }

  async getEnergyDashboard(userId: string) {
    const sources = await this.getUserEnergySources(userId);
    const meters = await this.getUserMeters(userId);
    const carbonCredits = await this.getTotalCarbonCredits(userId);

    let totalProduction = 0;
    let totalConsumption = 0;

    for (const meter of meters) {
      const readings = await this.getReadings(meter.id, 1);
      if (readings.length > 0) {
        totalProduction += Number(readings[0].productionKwh);
        totalConsumption += Number(readings[0].consumptionKwh);
      }
    }

    return {
      sources: sources.length,
      meters: meters.length,
      totalProduction,
      totalConsumption,
      netEnergy: totalProduction - totalConsumption,
      carbonCredits,
    };
  }
}
