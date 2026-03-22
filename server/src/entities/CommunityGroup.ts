import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { GridZone } from './GridZone';
import { User } from './User';
import { CommunityMember } from './CommunityMember';

@Entity('community_groups')
export class CommunityGroup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ name: 'grid_zone_id' })
  gridZoneId!: string;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // ── Relationships ──

  @ManyToOne(() => GridZone)
  @JoinColumn({ name: 'grid_zone_id' })
  gridZone!: GridZone;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @OneToMany(() => CommunityMember, (member) => member.group)
  members!: CommunityMember[];
}
