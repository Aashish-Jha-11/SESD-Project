import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Wallet } from '../entities/Wallet';
import { RegisterDto, LoginDto, AuthResponse } from '../dtos/auth.dto';
import { UserRole } from '../enums';

const JWT_SECRET = process.env.JWT_SECRET || 'greengrid-secret-key-2024';

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);
  private walletRepo = AppDataSource.getRepository(Wallet);

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: dto.role || UserRole.CONSUMER,
      gridZoneId: dto.gridZoneId,
    });

    const savedUser = await this.userRepo.save(user);

    const wallet = this.walletRepo.create({
      userId: savedUser.id,
      balance: 1000,
      escrowBalance: 0,
    });
    await this.walletRepo.save(wallet);

    const token = this.generateToken(savedUser);
    return { token, user: savedUser.getProfile() as any };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new Error('Invalid credentials');

    if (!user.isActive) throw new Error('Account is deactivated');

    const token = this.generateToken(user);
    return { token, user: user.getProfile() as any };
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
  }
}
