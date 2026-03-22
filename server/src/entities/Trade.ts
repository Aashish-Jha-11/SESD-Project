import {
  Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn,
  ManyToOne, OneToOne, JoinColumn,
} from 'typeorm';
import { TradeStatus } from '../enums';
import { Order } from './Order';
import { User } from './User';
import { GridZone } from './GridZone';
import { Settlement } from './Settlement';

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'buy_order_id' })
  buyOrderId!: string;

  @Column({ name: 'sell_order_id' })
  sellOrderId!: string;

  @Column({ name: 'buyer_id' })
  buyerId!: string;

  @Column({ name: 'seller_id' })
  sellerId!: string;

  @Column({ name: 'quantity_kwh', type: 'decimal', precision: 10, scale: 4 })
  quantityKwh!: number;

  @Column({ name: 'price_per_kwh', type: 'decimal', precision: 10, scale: 4 })
  pricePerKwh!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'varchar', default: TradeStatus.PENDING })
  status!: TradeStatus;

  @Column({ name: 'grid_zone_id' })
  gridZoneId!: string;

  @Column({ name: 'executed_at', type: 'datetime' })
  executedAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // ── Relationships ──

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'buy_order_id' })
  buyOrder!: Order;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'sell_order_id' })
  sellOrder!: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller!: User;

  @ManyToOne(() => GridZone)
  @JoinColumn({ name: 'grid_zone_id' })
  gridZone!: GridZone;

  @OneToOne(() => Settlement, (settlement) => settlement.trade)
  settlement!: Settlement;

  // ── Domain Methods (State pattern) ──

  confirmDelivery(): void {
    if (this.status !== TradeStatus.PENDING) {
      throw new Error(`Cannot confirm delivery for trade in ${this.status} status`);
    }
    this.status = TradeStatus.DELIVERED;
  }

  markSettled(): void {
    if (this.status !== TradeStatus.DELIVERED) {
      throw new Error(`Cannot settle trade in ${this.status} status`);
    }
    this.status = TradeStatus.SETTLED;
  }

  dispute(): void {
    if (this.status !== TradeStatus.PENDING && this.status !== TradeStatus.DELIVERED) {
      throw new Error(`Cannot dispute trade in ${this.status} status`);
    }
    this.status = TradeStatus.DISPUTED;
  }

  getTotalWithFee(feePercent: number = 2): number {
    return Number(this.totalAmount) * (1 + feePercent / 100);
  }

  getPlatformFee(feePercent: number = 2): number {
    return Number(this.totalAmount) * (feePercent / 100);
  }
}
