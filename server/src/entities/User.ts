import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToOne, OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import { UserRole } from '../enums';
import { Wallet } from './Wallet';
import { Order } from './Order';
import { EnergySource } from './EnergySource';
import { SmartMeter } from './SmartMeter';
import { Notification } from './Notification';
import { PriceAlert } from './PriceAlert';
import { CarbonCredit } from './CarbonCredit';
import { GridZone } from './GridZone';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', default: UserRole.CONSUMER })
  role!: UserRole;

  @Column({ name: 'grid_zone_id', nullable: true })
  gridZoneId!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // ── Relationships ──

  @ManyToOne(() => GridZone, { nullable: true })
  @JoinColumn({ name: 'grid_zone_id' })
  gridZone!: GridZone;

  @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
  wallet!: Wallet;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @OneToMany(() => EnergySource, (source) => source.prosumer)
  energySources!: EnergySource[];

  @OneToMany(() => SmartMeter, (meter) => meter.user)
  smartMeters!: SmartMeter[];

  @OneToMany(() => Notification, (notif) => notif.user)
  notifications!: Notification[];

  @OneToMany(() => PriceAlert, (alert) => alert.user)
  priceAlerts!: PriceAlert[];

  @OneToMany(() => CarbonCredit, (credit) => credit.prosumer)
  carbonCredits!: CarbonCredit[];

  // ── Domain Methods (OOP — Encapsulation) ──

  getProfile() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      gridZoneId: this.gridZoneId,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }

  deactivate(): void {
    this.isActive = false;
  }

  activate(): void {
    this.isActive = true;
  }

  isProsumer(): boolean {
    return this.role === UserRole.PROSUMER;
  }

  isGridOperator(): boolean {
    return this.role === UserRole.GRID_OPERATOR;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
