import { userRepository } from '../../repositories/userRepository';
import { sessionRepository } from '../../repositories/sessionRepository';
import { comparePassword } from '../../utils/password';
import { signJwt } from '../../utils/jwt';
import { randomBytes } from 'crypto';
import {
  InvalidCredentialsError,
  DisabledAccountError,
} from '../../utils/errors';

export async function loginWithMfaSupport({
  identifier,
  password,
}: {
  identifier: string;
  password: string;
}) {
  const userRepo = userRepository();
  const user = await userRepo.findOne({
    where: [{ email: identifier }, { username: identifier }],
    select: [
      'id',
      'username',
      'email',
      'password',
      'mfaEnabled',
      'mfaSecret',
      'emailVerified',
      'isActive',
    ],
  });

  if (!user) throw new InvalidCredentialsError('Invalid credentials');
  if (!user.isActive) throw new DisabledAccountError('Account disabled');
  if (!user.emailVerified) throw new InvalidCredentialsError('Email not verified');

  const valid = await comparePassword(password, user.password);
  if (!valid) throw new InvalidCredentialsError('Invalid credentials');

  if (user.mfaEnabled) {
    const mfaToken = signJwt({ userId: user.id, type: 'mfa' }, { expiresIn: '5m' });
    return { mfaRequired: true, mfaToken };
  }

  const accessToken = signJwt({ userId: user.id });
  const refreshToken = randomBytes(32).toString('hex');
  const sessionRepo = sessionRepository();
  const session = sessionRepo.create({
    userId: user.id,
    refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  await sessionRepo.save(session);

  return { accessToken, refreshToken };
}
