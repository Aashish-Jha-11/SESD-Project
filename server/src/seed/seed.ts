import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Wallet } from '../entities/Wallet';
import { GridZone } from '../entities/GridZone';
import { EnergySource } from '../entities/EnergySource';
import { SmartMeter } from '../entities/SmartMeter';
import { EnergyReading } from '../entities/EnergyReading';
import { UserRole, EnergySourceType, MeterStatus } from '../enums';
import bcrypt from 'bcryptjs';

export async function seedDatabase(): Promise<void> {
  const userRepo = AppDataSource.getRepository(User);
  const existingUsers = await userRepo.count();
  if (existingUsers > 0) return;

  console.log('Seeding database...');

  const zoneRepo = AppDataSource.getRepository(GridZone);
  const zones = await zoneRepo.save([
    zoneRepo.create({ name: 'Downtown Grid', maxCapacityKw: 5000, currentLoadKw: 2100 }),
    zoneRepo.create({ name: 'Suburban North', maxCapacityKw: 3000, currentLoadKw: 1200 }),
    zoneRepo.create({ name: 'Industrial East', maxCapacityKw: 8000, currentLoadKw: 5500 }),
    zoneRepo.create({ name: 'Residential West', maxCapacityKw: 4000, currentLoadKw: 1800 }),
  ]);

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await userRepo.save([
    userRepo.create({ email: 'prosumer@green.grid', passwordHash, name: 'Alice Solar', role: UserRole.PROSUMER, gridZoneId: zones[0].id }),
    userRepo.create({ email: 'consumer@green.grid', passwordHash, name: 'Bob Consumer', role: UserRole.CONSUMER, gridZoneId: zones[0].id }),
    userRepo.create({ email: 'operator@green.grid', passwordHash, name: 'Charlie Operator', role: UserRole.GRID_OPERATOR, gridZoneId: zones[0].id }),
    userRepo.create({ email: 'admin@green.grid', passwordHash, name: 'Diana Admin', role: UserRole.ADMIN, gridZoneId: zones[0].id }),
    userRepo.create({ email: 'prosumer2@green.grid', passwordHash, name: 'Eve Wind', role: UserRole.PROSUMER, gridZoneId: zones[1].id }),
    userRepo.create({ email: 'consumer2@green.grid', passwordHash, name: 'Frank Buyer', role: UserRole.CONSUMER, gridZoneId: zones[1].id }),
  ]);

  const walletRepo = AppDataSource.getRepository(Wallet);
  for (const user of users) {
    await walletRepo.save(walletRepo.create({ userId: user.id, balance: 1000, escrowBalance: 0 }));
  }

  const sourceRepo = AppDataSource.getRepository(EnergySource);
  await sourceRepo.save([
    sourceRepo.create({ prosumerId: users[0].id, type: EnergySourceType.SOLAR, capacityKw: 10, installedDate: new Date('2024-01-15') }),
    sourceRepo.create({ prosumerId: users[0].id, type: EnergySourceType.BATTERY, capacityKw: 5, installedDate: new Date('2024-03-10') }),
    sourceRepo.create({ prosumerId: users[4].id, type: EnergySourceType.WIND, capacityKw: 15, installedDate: new Date('2023-11-01') }),
  ]);

  const meterRepo = AppDataSource.getRepository(SmartMeter);
  const meters = await meterRepo.save([
    meterRepo.create({ userId: users[0].id, gridZoneId: zones[0].id, serialNumber: 'SM-001-DT' }),
    meterRepo.create({ userId: users[1].id, gridZoneId: zones[0].id, serialNumber: 'SM-002-DT' }),
    meterRepo.create({ userId: users[4].id, gridZoneId: zones[1].id, serialNumber: 'SM-003-SN' }),
    meterRepo.create({ userId: users[5].id, gridZoneId: zones[1].id, serialNumber: 'SM-004-SN' }),
  ]);

  const readingRepo = AppDataSource.getRepository(EnergyReading);
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - i * 3600000);
    const hour = timestamp.getHours();

    await readingRepo.save([
      readingRepo.create({
        meterId: meters[0].id,
        productionKwh: hour >= 6 && hour <= 18 ? 5 + Math.random() * 5 : 0,
        consumptionKwh: 2 + Math.random() * 3,
        netEnergyKwh: 0,
        recordedAt: timestamp,
      }),
      readingRepo.create({
        meterId: meters[1].id,
        productionKwh: 0,
        consumptionKwh: 3 + Math.random() * 4,
        netEnergyKwh: 0,
        recordedAt: timestamp,
      }),
    ]);
  }

  console.log(`Seeded: ${zones.length} zones, ${users.length} users, meters, and readings`);
}
