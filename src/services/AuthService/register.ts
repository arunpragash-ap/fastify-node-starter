import { userRepository } from '../../repositories/userRepository';
import { hashPassword } from '../../utils/password';
import { sendEmail } from '../../utils/email';
import { generateVerificationCode } from '../../utils/generateCode';
import { EMAIL_VERIFICATION_EXPIRY_MINUTES } from '../../constants/auth';
import { NotFoundError } from '../../utils/errors';

export async function registerWithCode({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) {
  const userRepo = userRepository();
  const existing = await userRepo.findOne({ where: [{ username }, { email }] });
  if (existing) throw new Error('Username or email already exists.');

  const hashedPassword = await hashPassword(password);
  const verificationCode = generateVerificationCode(6);
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MINUTES * 60 * 1000);

  const user = userRepo.create({
    username,
    email,
    password: hashedPassword,
    emailVerified: false,
    emailVerificationToken: verificationCode,
    emailVerificationExpires: expires,
  });
  await userRepo.save(user);
await sendEmail(
    email,
    `Verify your email - ${verificationCode}`,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Please use the following verification code to complete your registration:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="margin-bottom: 10px; font-size: 14px;">Your verification code:</p>
            <div 
                onclick="navigator.clipboard.writeText('${verificationCode}'); alert('Verification code copied!');"
                style="font-size: 24px; font-weight: bold; letter-spacing: 2px; cursor: pointer; color: #2c7be5;"
                title="Click to copy"
            >
                ${verificationCode}
            </div>
        </div>
        
        <p style="font-size: 12px; color: #666;">
            This email is from XYZ company for ABC product verification. 
            The OTP is valid for ${expires} minutes.
        </p>
        
        <p style="font-size: 12px; color: #999; margin-top: 30px;">
            If you didn't request this code, please ignore this email.
        </p>
    </div>
    `
);

  return { id: user.id, email: user.email, username: user.username };
}
