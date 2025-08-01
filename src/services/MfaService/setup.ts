import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';

export async function setupMfa(userId: string) {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });
  if (!user) throw new Error('User not found');

  const secret = authenticator.generateSecret();
  user.mfaSecret = secret;
  await userRepo.save(user);

  const otpauth = authenticator.keyuri(user.email, 'LemonApp', secret);
  const qr = await qrcode.toDataURL(otpauth);
  return { secret, qr };
}