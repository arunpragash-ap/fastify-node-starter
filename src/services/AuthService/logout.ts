import { sessionRepository } from '../../repositories/sessionRepository';

export async function logout({ refreshToken }: { refreshToken: string }): Promise<boolean> {
  const sessionRepo = sessionRepository();
  await sessionRepo.delete({ refreshToken });
  return true;
}
