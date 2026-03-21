import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { MeterStatus } from '../enums';
import { User } from './User';
import { GridZone } from './GridZone';
import { EnergyReading } from './EnergyReading';

@Entity('smart_meters')
export class SmartMeter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'serial_number', unique: true })
  serialNumber!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'grid_zone_id' })
  gridZoneId!: string;

  @Column({ type: 'varchar', default: MeterStatus.ACTIVE })
  status!: MeterStatus;

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt!: Date;

  // ── Relationships ──

  @ManyToOne(() => User, (user) => user.smartMeters)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => GridZone)
  @JoinColumn({ name: 'grid_zone_id' })
  gridZone!: GridZone;

  @OneToMany(() => EnergyReading, (reading) => reading.meter)
  readings!: EnergyReading[];

  // ── Domain Methods ──

  isOperational(): boolean {
    return this.status === MeterStatus.ACTIVE;
  }

  setMaintenance(): void {
    this.status = MeterStatus.MAINTENANCE;
  }

  activate(): void {
    this.status = MeterStatus.ACTIVE;
  }
}
