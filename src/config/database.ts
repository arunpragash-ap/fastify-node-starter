import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Session } from '../entities/Session';
import 'reflect-metadata';
import 'dotenv/config';
export const AppDataSource = new DataSource({
  type: 'mysql',
  url: 'mysql://lemon:lemon_password@localhost:3306/lemon_management',
  entities: [User, Session],
  synchronize: true, // Use migrations in production
  logging: false,
  poolSize: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

