import { DataSource } from 'typeorm';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.join(__dirname, '../../greengrid.db'),
  synchronize: true, // Auto-sync schema in dev — disable in production
  logging: false,
  entities: [path.join(__dirname, '../entities/*.{ts,js}')],
});
