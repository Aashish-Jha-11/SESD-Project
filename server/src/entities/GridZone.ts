import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ZoneStatus } from '../enums';

@Entity('grid_zones')
export class GridZone {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ name: 'boundary_geojson', type: 'simple-json', nullable: true })
  boundaryGeoJson!: object;

  @Column({ name: 'max_capacity_kw', type: 'decimal', precision: 12, scale: 2, default: 1000 })
  maxCapacityKw!: number;

  @Column({ name: 'current_load_kw', type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentLoadKw!: number;

  @Column({ type: 'varchar', default: ZoneStatus.ACTIVE })
  status!: ZoneStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // ── Domain Methods ──

  isOverloaded(): boolean {
    return Number(this.currentLoadKw) >= Number(this.maxCapacityKw);
  }

  halt(): void {
    this.status = ZoneStatus.HALTED;
  }

  resume(): void {
    this.status = ZoneStatus.ACTIVE;
  }

  isActive(): boolean {
    return this.status === ZoneStatus.ACTIVE;
  }

  getLoadPercentage(): number {
    if (Number(this.maxCapacityKw) === 0) return 0;
    return (Number(this.currentLoadKw) / Number(this.maxCapacityKw)) * 100;
  }
}
