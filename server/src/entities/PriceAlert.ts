import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { AlertDirection } from '../enums';
import { User } from './User';
import { GridZone } from './GridZone';

@Entity('price_alerts')
export class PriceAlert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'grid_zone_id' })
  gridZoneId!: string;

  @Column({ name: 'target_price', type: 'decimal', precision: 10, scale: 4 })
  targetPrice!: number;

  @Column({ type: 'varchar' })
  direction!: AlertDirection;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // ── Relationships ──

  @ManyToOne(() => User, (user) => user.priceAlerts)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => GridZone)
  @JoinColumn({ name: 'grid_zone_id' })
  gridZone!: GridZone;

  // ── Domain ──

  evaluate(currentPrice: number): boolean {
    if (!this.isActive) return false;
    if (this.direction === AlertDirection.ABOVE) {
      return currentPrice >= Number(this.targetPrice);
    }
    return currentPrice <= Number(this.targetPrice);
  }

  deactivate(): void {
    this.isActive = false;
  }
}
