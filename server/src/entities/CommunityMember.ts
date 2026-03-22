import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { CommunityRole } from '../enums';
import { CommunityGroup } from './CommunityGroup';
import { User } from './User';

@Entity('community_members')
export class CommunityMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'group_id' })
  groupId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', default: CommunityRole.MEMBER })
  role!: CommunityRole;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt!: Date;

  // ── Relationships ──

  @ManyToOne(() => CommunityGroup, (group) => group.members)
  @JoinColumn({ name: 'group_id' })
  group!: CommunityGroup;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
