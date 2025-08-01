import { AppDataSource } from '../config/database';
import { Session } from '../entities/Session';

export const sessionRepository = () => AppDataSource.getRepository(Session);
