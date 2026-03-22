import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { OrderType, OrderStatus, SourceTypeFilter } from '../enums';
import { User } from './User';
import { GridZone } from './GridZone';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar' })
  type!: OrderType;

  @Column({ name: 'quantity_kwh', type: 'decimal', precision: 10, scale: 4 })
  quantityKwh!: number;

  @Column({ name: 'price_per_kwh', type: 'decimal', precision: 10, scale: 4 })
  pricePerKwh!: number;

  @Column({ type: 'varchar', default: OrderStatus.ACTIVE })
  status!: OrderStatus;

  @Column({ name: 'grid_zone_id' })
  gridZoneId!: string;

  @Column({ name: 'source_type', type: 'varchar', default: SourceTypeFilter.ANY })
  sourceType!: SourceTypeFilter;

  @Column({ name: 'time_window_start', type: 'datetime' })
  timeWindowStart!: Date;

  @Column({ name: 'time_window_end', type: 'datetime' })
  timeWindowEnd!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // ── Relationships ──

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => GridZone)
  @JoinColumn({ name: 'grid_zone_id' })
  gridZone!: GridZone;

  // ── Domain Methods (State Pattern behavior) ──

  cancel(): void {
    if (this.status !== OrderStatus.ACTIVE) {
      throw new Error(`Cannot cancel order in ${this.status} status`);
    }
    this.status = OrderStatus.CANCELLED;
  }

  markMatched(): void {
    if (this.status !== OrderStatus.ACTIVE) {
      throw new Error(`Cannot match order in ${this.status} status`);
    }
    this.status = OrderStatus.MATCHED;
  }

  isExpired(): boolean {
    return new Date() > new Date(this.timeWindowEnd);
  }

  isActive(): boolean {
    return this.status === OrderStatus.ACTIVE && !this.isExpired();
  }

  isBuyOrder(): boolean {
    return this.type === OrderType.BUY;
  }

  isSellOrder(): boolean {
    return this.type === OrderType.SELL;
  }

  getTotalValue(): number {
    return Number(this.quantityKwh) * Number(this.pricePerKwh);
  }
}
