import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Session } from '../entities/Session';
import 'reflect-metadata';
import 'dotenv/config';
export const AppDataSource = new DataSource({
  type: 'mysql',
  url: 'mysql://sago_factory:sago_factory@localhost:3306/b_sago_factory',
  entities: [User, Session],
  synchronize: true, // Use migrations in production
  logging: false,
  poolSize: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

