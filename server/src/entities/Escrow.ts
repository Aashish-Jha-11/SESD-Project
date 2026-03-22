import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { EscrowStatus } from '../enums';
import { Trade } from './Trade';
import { User } from './User';

@Entity('escrows')
export class Escrow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'trade_id' })
  tradeId!: string;

  @Column({ name: 'buyer_id' })
  buyerId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', default: EscrowStatus.HELD })
  status!: EscrowStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt!: Date;

  // ── Relationships ──

  @ManyToOne(() => Trade)
  @JoinColumn({ name: 'trade_id' })
  trade!: Trade;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer!: User;

  // ── Domain ──

  release(): void {
    this.status = EscrowStatus.RELEASED;
    this.resolvedAt = new Date();
  }

  refund(): void {
    this.status = EscrowStatus.REFUNDED;
    this.resolvedAt = new Date();
  }
}
