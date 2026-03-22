import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { SmartMeter } from './SmartMeter';

@Entity('energy_readings')
export class EnergyReading {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'meter_id' })
  meterId!: string;

  @Column({ name: 'production_kwh', type: 'decimal', precision: 10, scale: 4, default: 0 })
  productionKwh!: number;

  @Column({ name: 'consumption_kwh', type: 'decimal', precision: 10, scale: 4, default: 0 })
  consumptionKwh!: number;

  @Column({ name: 'net_energy_kwh', type: 'decimal', precision: 10, scale: 4, default: 0 })
  netEnergyKwh!: number;

  @Column({ name: 'recorded_at', type: 'datetime' })
  recordedAt!: Date;

  // ── Relationship ──

  @ManyToOne(() => SmartMeter, (meter) => meter.readings)
  @JoinColumn({ name: 'meter_id' })
  meter!: SmartMeter;

  // ── Domain ──

  isProducing(): boolean {
    return Number(this.netEnergyKwh) > 0;
  }

  isConsuming(): boolean {
    return Number(this.netEnergyKwh) < 0;
  }
}
