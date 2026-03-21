import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToOne, JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', unique: true })
  userId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance!: number;

  @Column({ name: 'escrow_balance', type: 'decimal', precision: 12, scale: 2, default: 0 })
  escrowBalance!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // ── Relationship ──

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // ── Domain Methods (OOP — Encapsulation) ──

  credit(amount: number): void {
    if (amount <= 0) throw new Error('Credit amount must be positive');
    this.balance = Number(this.balance) + amount;
  }

  debit(amount: number): void {
    if (amount <= 0) throw new Error('Debit amount must be positive');
    if (Number(this.balance) < amount) throw new Error('Insufficient balance');
    this.balance = Number(this.balance) - amount;
  }

  holdEscrow(amount: number): void {
    if (amount <= 0) throw new Error('Escrow amount must be positive');
    if (Number(this.balance) < amount) throw new Error('Insufficient balance for escrow');
    this.balance = Number(this.balance) - amount;
    this.escrowBalance = Number(this.escrowBalance) + amount;
  }

  releaseEscrow(amount: number): void {
    if (amount <= 0) throw new Error('Release amount must be positive');
    if (Number(this.escrowBalance) < amount) throw new Error('Insufficient escrow balance');
    this.escrowBalance = Number(this.escrowBalance) - amount;
  }

  getAvailableBalance(): number {
    return Number(this.balance);
  }

  getTotalBalance(): number {
    return Number(this.balance) + Number(this.escrowBalance);
  }
}
