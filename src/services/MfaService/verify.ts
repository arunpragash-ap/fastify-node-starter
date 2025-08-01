import { authenticator } from 'otplib';
import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';

export async function verifyMfa(userId: string, token: string) {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo
    .createQueryBuilder('user')
    .where('user.id = :id', { id: userId })
    .addSelect('user.mfaSecret')
    .getOne();

  if (!user || !user.mfaSecret) throw new Error('MFA not setup');

  const isValid = authenticator.check(token, user.mfaSecret);
  if (isValid) {
    user.mfaEnabled = true;
    await userRepo.save(user);
  }
  return isValid;
}