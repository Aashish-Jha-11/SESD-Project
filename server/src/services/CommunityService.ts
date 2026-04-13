import { AppDataSource } from '../config/database';
import { CommunityGroup } from '../entities/CommunityGroup';
import { CommunityMember } from '../entities/CommunityMember';
import { CommunityRole } from '../enums';

export class CommunityService {
  private groupRepo = AppDataSource.getRepository(CommunityGroup);
  private memberRepo = AppDataSource.getRepository(CommunityMember);

  async createGroup(name: string, description: string, gridZoneId: string, createdBy: string): Promise<CommunityGroup> {
    const group = this.groupRepo.create({ name, description, gridZoneId, createdBy });
    const saved = await this.groupRepo.save(group);

    // Creator becomes admin of the group
    const member = this.memberRepo.create({
      groupId: saved.id,
      userId: createdBy,
      role: CommunityRole.ADMIN,
    });
    await this.memberRepo.save(member);

    return this.getById(saved.id);
  }

  async getAll(): Promise<CommunityGroup[]> {
    return this.groupRepo.find({
      relations: ['gridZone', 'creator', 'members'],
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: string): Promise<CommunityGroup> {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['gridZone', 'creator', 'members', 'members.user'],
    });
    if (!group) throw new Error('Community group not found');
    return group;
  }

  async getByZone(gridZoneId: string): Promise<CommunityGroup[]> {
    return this.groupRepo.find({
      where: { gridZoneId },
      relations: ['creator', 'members'],
      order: { createdAt: 'DESC' },
    });
  }

  async joinGroup(groupId: string, userId: string): Promise<CommunityMember> {
    const existing = await this.memberRepo.findOne({ where: { groupId, userId } });
    if (existing) throw new Error('Already a member of this group');

    const member = this.memberRepo.create({
      groupId,
      userId,
      role: CommunityRole.MEMBER,
    });
    return this.memberRepo.save(member);
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const member = await this.memberRepo.findOne({ where: { groupId, userId } });
    if (!member) throw new Error('Not a member of this group');
    if (member.role === CommunityRole.ADMIN) {
      const adminCount = await this.memberRepo.count({
        where: { groupId, role: CommunityRole.ADMIN },
      });
      if (adminCount <= 1) throw new Error('Cannot leave: you are the only admin');
    }
    await this.memberRepo.remove(member);
  }

  async getUserGroups(userId: string): Promise<CommunityGroup[]> {
    const memberships = await this.memberRepo.find({
      where: { userId },
      relations: ['group', 'group.gridZone', 'group.members'],
    });
    return memberships.map((m) => m.group);
  }

  async getGroupMembers(groupId: string): Promise<CommunityMember[]> {
    return this.memberRepo.find({
      where: { groupId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  async getMemberCount(groupId: string): Promise<number> {
    return this.memberRepo.count({ where: { groupId } });
  }
}
