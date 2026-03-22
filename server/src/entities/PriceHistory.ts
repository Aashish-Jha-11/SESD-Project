import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('price_history')
export class PriceHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'grid_zone_id' })
  gridZoneId!: string;

  @Column({ name: 'price_per_kwh', type: 'decimal', precision: 10, scale: 4 })
  pricePerKwh!: number;

  @Column({ name: 'supply_kwh', type: 'decimal', precision: 10, scale: 4, default: 0 })
  supplyKwh!: number;

  @Column({ name: 'demand_kwh', type: 'decimal', precision: 10, scale: 4, default: 0 })
  demandKwh!: number;

  @Column({ name: 'recorded_at', type: 'datetime' })
  recordedAt!: Date;
}
