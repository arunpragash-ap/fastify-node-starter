import { authenticator } from 'otplib';
import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';

export async function disableMfa(userId: string, token: string) {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo
    .createQueryBuilder('user')
    .where('user.id = :id', { id: userId })
    .addSelect('user.mfaSecret')
    .getOne();
  if (!user) throw new Error('User not found');
  if (!user.mfaSecret) throw new Error('MFA not setup');

  const isValid = authenticator.check(token, user.mfaSecret);
  if (!isValid) throw new Error('Invalid MFA token');

  user.mfaSecret = null as any;
  user.mfaEnabled = false;
  await userRepo.save(user);
  return true;
}