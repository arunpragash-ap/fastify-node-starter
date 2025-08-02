import { userRepository } from '../../repositories/userRepository';
import { sendEmail } from '../../utils/email';
import { generateOtp } from '../../utils/generateCode';
import { hashPassword } from '../../utils/password';
import { FORGOT_PASSWORD_EXPIRY_MINUTES } from '../../constants/auth';
import { NotFoundError, TokenExpiredError } from '../../utils/errors';

export async function forgotPassword({ email }: { email: string }): Promise<boolean> {
  const userRepo = userRepository();
  const user = await userRepo.findOneBy({ email });
  if (!user) throw new NotFoundError('User not found');
  const otp = generateOtp();
  user.forgotPasswordOtp = otp;
  user.forgotPasswordExpires = new Date(
    Date.now() + FORGOT_PASSWORD_EXPIRY_MINUTES * 60000
  );
  await userRepo.save(user);
  await sendEmail(email, 'Password Reset OTP', `<p>Your OTP is: <b>${otp}</b></p>`);
  return true;
}
export async function verifyForgotOtp({ email, otp }: { email: string; otp: string }): Promise<boolean> {
  const userRepo = userRepository();
  const user = await userRepo.findOne({
    where: { email },
    select: [
      'id',
      'email',
      'forgotPasswordOtp',
      'forgotPasswordExpires',
    ],
  });



  if (!user || user.forgotPasswordOtp !== otp) throw new Error('Invalid OTP');
  if (user.forgotPasswordExpires! < new Date())
    throw new TokenExpiredError('OTP expired');

  return true;
}


export async function resetPassword({
  email,
  otp,
  newPassword,
}: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<boolean> {
  const userRepo = userRepository();
  const user = await userRepo.findOne({where:{ email },select: [
      'id',
      'email',
      'forgotPasswordOtp',
      'forgotPasswordExpires',
    ]});
  if (!user || user.forgotPasswordOtp !== otp) throw new Error('Invalid OTP');
  if (user.forgotPasswordExpires! < new Date())
    throw new TokenExpiredError('OTP expired');

  user.password = await hashPassword(newPassword);
  user.forgotPasswordOtp = undefined;
  user.forgotPasswordExpires = undefined;
  await userRepo.save(user);
  return true;
}
