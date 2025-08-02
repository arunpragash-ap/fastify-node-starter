import { AppDataSource } from "../../config/database";
import { User } from "../../entities/User";


export async function getMfaStatus(userId: string): Promise<{ enabled: boolean }> {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });
  if (!user) throw new Error('User not found');
  return { enabled: user.mfaEnabled };
}