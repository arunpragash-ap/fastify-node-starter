import { authenticator } from 'otplib';
import { randomBytes } from 'crypto';
import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';
import { Session } from '../../entities/Session';
import { signJwt } from '../../utils/jwt';

export async function verifyAndIssueTokens(userId: string, mfaCode: string): Promise<{ accessToken: string; refreshToken: string }> {
  const userRepo = AppDataSource.getRepository(User);
  const sessionRepo = AppDataSource.getRepository(Session);
  const user = await userRepo
    .createQueryBuilder('user')
    .where('user.id = :id', { id: userId })
    .addSelect('user.mfaSecret')
    .getOne();

  if (!user || !user.mfaSecret) throw new Error('MFA not setup');
  const isValid = authenticator.check(mfaCode, user.mfaSecret);
  if (!isValid) throw new Error('Invalid MFA code');

  const accessToken = signJwt({ userId });
  const refreshToken = randomBytes(32).toString('hex');
  const session = sessionRepo.create({
    userId,
    refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  await sessionRepo.save(session);
  return { accessToken, refreshToken };
}