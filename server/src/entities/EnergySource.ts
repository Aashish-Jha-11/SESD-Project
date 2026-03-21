import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { EnergySourceType } from '../enums';
import { User } from './User';

@Entity('energy_sources')
export class EnergySource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'prosumer_id' })
  prosumerId!: string;

  @Column({ type: 'varchar' })
  type!: EnergySourceType;

  @Column({ name: 'capacity_kw', type: 'decimal', precision: 10, scale: 2 })
  capacityKw!: number;

  @Column({ name: 'installed_date', type: 'date', nullable: true })
  installedDate!: Date;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // ── Relationship ──

  @ManyToOne(() => User, (user) => user.energySources)
  @JoinColumn({ name: 'prosumer_id' })
  prosumer!: User;

  // ── Domain Methods ──

  getEstimatedOutput(hourOfDay: number): number {
    const capacity = Number(this.capacityKw);
    switch (this.type) {
      case EnergySourceType.SOLAR:
        // Solar output curve: peaks at noon
        if (hourOfDay >= 6 && hourOfDay <= 18) {
          const peakFactor = 1 - Math.abs(hourOfDay - 12) / 6;
          return capacity * peakFactor * 0.8;
        }
        return 0;
      case EnergySourceType.WIND:
        // Wind is more constant with slight variation
        return capacity * (0.3 + Math.random() * 0.4);
      case EnergySourceType.BATTERY:
        return capacity * 0.9; // Battery discharge rate
      case EnergySourceType.HYDRO:
        return capacity * 0.7; // Constant hydro output
      default:
        return 0;
    }
  }
}
