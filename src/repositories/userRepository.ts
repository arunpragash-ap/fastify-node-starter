import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export const userRepository = (): Repository<User> => AppDataSource.getRepository(User);
