import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CommunityService } from '../services/CommunityService';

export class CommunityController {
  private communityService: CommunityService;
  public router = Router();

  constructor(communityService: CommunityService) {
    this.communityService = communityService;
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/my', this.getMyGroups.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.get('/:id/members', this.getMembers.bind(this));
    this.router.post('/', this.createGroup.bind(this));
    this.router.post('/:id/join', this.joinGroup.bind(this));
    this.router.post('/:id/leave', this.leaveGroup.bind(this));
  }

  private async getAll(_req: AuthRequest, res: Response) {
    try {
      const groups = await this.communityService.getAll();
      res.json(groups);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getMyGroups(req: AuthRequest, res: Response) {
    try {
      const groups = await this.communityService.getUserGroups(req.user!.userId);
      res.json(groups);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getById(req: AuthRequest, res: Response) {
    try {
      const group = await this.communityService.getById(req.params.id);
      res.json(group);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async getMembers(req: AuthRequest, res: Response) {
    try {
      const members = await this.communityService.getGroupMembers(req.params.id);
      res.json(members);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async createGroup(req: AuthRequest, res: Response) {
    try {
      const { name, description, gridZoneId } = req.body;
      const group = await this.communityService.createGroup(
        name, description, gridZoneId, req.user!.userId,
      );
      res.status(201).json(group);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async joinGroup(req: AuthRequest, res: Response) {
    try {
      const member = await this.communityService.joinGroup(req.params.id, req.user!.userId);
      res.json(member);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  private async leaveGroup(req: AuthRequest, res: Response) {
    try {
      await this.communityService.leaveGroup(req.params.id, req.user!.userId);
      res.json({ message: 'Left group successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
