import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToOne, JoinColumn,
} from 'typeorm';
import { SettlementStatus } from '../enums';
import { Trade } from './Trade';

@Entity('settlements')
export class Settlement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'trade_id', unique: true })
  tradeId!: string;

  @Column({ name: 'seller_amount', type: 'decimal', precision: 12, scale: 2 })
  sellerAmount!: number;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 12, scale: 2 })
  platformFee!: number;

  @Column({ name: 'carbon_credits_issued', type: 'decimal', precision: 10, scale: 4, default: 0 })
  carbonCreditsIssued!: number;

  @Column({ type: 'varchar', default: SettlementStatus.PENDING })
  status!: SettlementStatus;

  @Column({ name: 'settled_at', type: 'datetime', nullable: true })
  settledAt!: Date;

  // ── Relationship ──

  @OneToOne(() => Trade, (trade) => trade.settlement)
  @JoinColumn({ name: 'trade_id' })
  trade!: Trade;

  // ── Domain ──

  complete(): void {
    this.status = SettlementStatus.COMPLETED;
    this.settledAt = new Date();
  }

  fail(): void {
    this.status = SettlementStatus.FAILED;
  }
}
