import { sessionRepository } from '../../repositories/sessionRepository';

export async function logout({ refreshToken }: { refreshToken: string }) {
  const sessionRepo = sessionRepository();
  await sessionRepo.delete({ refreshToken });
  return true;
}
