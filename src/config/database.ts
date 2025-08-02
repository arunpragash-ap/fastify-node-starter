import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Session } from '../entities/Session';
import 'reflect-metadata';
import 'dotenv/config';
import { Option } from '../entities/Option';
export const AppDataSource = new DataSource({
  type: 'mysql',
  url: 'mysql://sago_factory:sago_factory@localhost:3306/sago_factory',
  entities: [User, Session, Option],
  synchronize: true, // Use migrations in production
  logging: false,
  poolSize: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

