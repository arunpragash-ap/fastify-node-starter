import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Session } from '../entities/Session';

export const sessionRepository = (): Repository<Session> => AppDataSource.getRepository(Session);
