import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Trade } from './Trade';

@Entity('carbon_credits')
export class CarbonCredit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'prosumer_id' })
  prosumerId!: string;

  @Column({ name: 'trade_id' })
  tradeId!: string;

  @Column({ name: 'kwh_generated', type: 'decimal', precision: 10, scale: 4 })
  kwhGenerated!: number;

  @Column({ name: 'certificate_hash', unique: true })
  certificateHash!: string;

  @Column({ name: 'issued_at', type: 'datetime' })
  issuedAt!: Date;

  // ── Relationships ──

  @ManyToOne(() => User, (user) => user.carbonCredits)
  @JoinColumn({ name: 'prosumer_id' })
  prosumer!: User;

  @ManyToOne(() => Trade)
  @JoinColumn({ name: 'trade_id' })
  trade!: Trade;
}
