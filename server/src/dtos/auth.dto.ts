import { UserRole } from '../enums';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  gridZoneId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    gridZoneId: string;
  };
}
