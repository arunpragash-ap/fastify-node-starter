import { sessionRepository } from '../../repositories/sessionRepository';
import { userRepository } from '../../repositories/userRepository';
import { signJwt } from '../../utils/jwt';
import { InvalidCredentialsError, NotFoundError } from '../../utils/errors';

export async function refreshSession({ refreshToken }: { refreshToken: string }) {
  const sessionRepo = sessionRepository();
  const session = await sessionRepo.findOneBy({ refreshToken });
  if (!session || session.expiresAt < new Date())
    throw new InvalidCredentialsError('Invalid or expired refresh token');

  const userRepo = userRepository();
  const user = await userRepo.findOneBy({ id: session.userId });
  if (!user) throw new NotFoundError('User not found');

  const accessToken = signJwt({ userId: user.id });
  return { accessToken };
}
