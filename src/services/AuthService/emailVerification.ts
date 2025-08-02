import { userRepository } from '../../repositories/userRepository';
import { randomBytes } from 'crypto';
import { sendEmail } from '../../utils/email';
import {
  EMAIL_VERIFICATION_EXPIRY_MINUTES,
} from '../../constants/auth';
import { NotFoundError, AlreadyVerifiedError, TokenExpiredError, InvalidCredentialsError } from '../../utils/errors';
import { generateVerificationCode } from '../../utils/generateCode';

export async function sendEmailVerification({ userId }: { userId: string }): Promise<boolean> {
  const userRepo = userRepository();
  const user = await userRepo.findOneBy({ id: userId });
  if (!user) throw new NotFoundError('User not found');
  if (user.emailVerified) throw new AlreadyVerifiedError('Email already verified');

  const token = randomBytes(24).toString('hex');
  user.emailVerificationToken = token;
  user.emailVerificationExpires = new Date(
    Date.now() + EMAIL_VERIFICATION_EXPIRY_MINUTES * 60000
  );
  await userRepo.save(user);

  const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  await sendEmail(
    user.email,
    'Verify your email',
    `<p>Click <a href="${link}">here</a> to verify your email.</p>`
  );
  return true;
}

export async function verifyEmail({ token }: { token: string }): Promise<boolean> {
  const userRepo = userRepository();
  const user = await userRepo.findOne({
    where: { emailVerified: false },
    select: [
      'id',
      'email',
      'emailVerified',
      'emailVerificationToken',
      'emailVerificationExpires',
    ],
  });
  if (!user || user.emailVerificationToken !== token)
    throw new NotFoundError('Invalid token');
  if (user.emailVerificationExpires! < new Date())
    throw new TokenExpiredError('Token expired');

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await userRepo.save(user);
  return true;
}

export async function verifyEmailWithCode({
  email,
  code,
}: {
  email: string;
  code: string;
}): Promise<boolean> {
  const userRepo = userRepository();
  const user = await userRepo.findOne({
    where: { email },
    select: [
      'id',
      'email',
      'emailVerified',
      'emailVerificationToken',
      'emailVerificationExpires',
    ],
  });

  if (!user) throw new NotFoundError('User not found.');
  if (user.emailVerified) throw new AlreadyVerifiedError('Email already verified.');
  if (!user.emailVerificationToken || !user.emailVerificationExpires) {
    throw new Error('No verification code found. Please request a new one.');
  }
  if (user.emailVerificationToken !== code) throw new InvalidCredentialsError('Invalid verification code.');
  if (user.emailVerificationExpires < new Date())
    throw new TokenExpiredError('Verification code expired.');

  await userRepo.update(user.id, {
    emailVerified: true,
    emailVerificationToken: undefined,
    emailVerificationExpires: undefined,
  });
  return true;
}

export async function resendVerificationCode({ email }: { email: string }): Promise<boolean> {
  const userRepo = userRepository();
  const user = await userRepo.findOne({ where: { email } });
  if (!user) throw new NotFoundError('User not found.');
  if (user.emailVerified) throw new AlreadyVerifiedError('Email already verified.');

  const verificationCode = generateVerificationCode(6);
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MINUTES * 60000);
  user.emailVerificationToken = verificationCode;
  user.emailVerificationExpires = expires;
  await userRepo.save(user);

  await sendEmail(
    email,
    'Verify your email',
    `<p>Your verification code is: <b>${verificationCode}</b></p>`
  );
  return true;
}
