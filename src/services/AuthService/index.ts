import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';
import { Session } from '../../entities/Session';
import { hashPassword, comparePassword } from '../../utils/password';
import { signJwt, verifyJwt } from '../../utils/jwt';
import { sendEmail } from '../../utils/email';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import 'dotenv/config';

const EMAIL_VERIFICATION_EXPIRY_MINUTES = 15;
const FORGOT_PASSWORD_EXPIRY_MINUTES = 15;

export class AuthService {
  // Register a new user and send a 6-character email verification code
  async registerWithCode({ username, email, password }: { username: string; email: string; password: string }) {
    const userRepo = AppDataSource.getRepository(User);
    // Check for existing user
    const existing = await userRepo.findOne({ where: [{ username }, { email }] });
    if (existing) throw new Error('Username or email already exists.');
    // Hash password
    const hashedPassword = await hashPassword(password);
    // Generate 6-char verification code (letters, numbers, special chars)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let verificationCode = '';
    for (let i = 0; i < 6; i++) {
      verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 min expiry
    // Create user
    const user = userRepo.create({
      username,
      email,
      password: hashedPassword,
      emailVerified: false,
      emailVerificationToken: verificationCode,
      emailVerificationExpires: expires,
    });
    await userRepo.save(user);
    // Send verification email
    await sendEmail(
      email,
      'Verify your email',
      `<p>Your verification code is: <b>${verificationCode}</b></p>`
    );
    return { id: user.id, email: user.email, username: user.username };
  }

  // Login with MFA support
  async loginWithMfaSupport({ identifier, password }: { identifier: string; password: string }) {
    const userRepo = AppDataSource.getRepository(User);
    // 1. Find user by email or username
    const user = await userRepo.findOne({
      where: [ { email: identifier }, { username: identifier } ],
      select: ['id', 'username', 'email', 'password', 'mfaEnabled', 'mfaSecret', 'emailVerified', 'isActive']
    });
    if (!user) throw new Error('Invalid credentials');
    if (!user.isActive) throw new Error('Account disabled');
    if (!user.emailVerified) throw new Error('Email not verified');
    // 2. Check password
    const valid = await comparePassword(password, user.password);
    if (!valid) throw new Error('Invalid credentials');
    // 3. If user has MFA enabled, return short-lived MFA token
    if (user.mfaEnabled) {
      const mfaToken = signJwt({ userId: user.id, type: 'mfa' }, { expiresIn: '5m' });
      return { mfaRequired: true, mfaToken };
    }
    // 4. If no MFA, issue JWT and session tokens
    const accessToken = signJwt({ userId: user.id });
    const refreshToken = randomBytes(32).toString('hex');
    const sessionRepo = AppDataSource.getRepository(Session);
    const session = sessionRepo.create({ userId: user.id, refreshToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    await sessionRepo.save(session);
    return { accessToken, refreshToken };
  }

  // Refresh JWT using refresh token
  async refresh({ refreshToken }: { refreshToken: string }) {
    const sessionRepo = AppDataSource.getRepository(Session);
    const session = await sessionRepo.findOneBy({ refreshToken });
    if (!session || session.expiresAt < new Date()) throw new Error('Invalid or expired refresh token');
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: session.userId });
    if (!user) throw new Error('User not found');
    const accessToken = signJwt({ userId: user.id });
    return { accessToken };
  }

  // Logout (invalidate refresh token)
  async logout({ refreshToken }: { refreshToken: string }) {
    const sessionRepo = AppDataSource.getRepository(Session);
    await sessionRepo.delete({ refreshToken });
    return true;
  }

  // Send email verification (resend)
  async sendEmailVerification({ userId }: { userId: string }) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');
    const token = randomBytes(24).toString('hex');
    (user as any).emailVerificationToken = token;
    (user as any).emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MINUTES * 60000);
    await userRepo.save(user);
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    await sendEmail(user.email, 'Verify your email', `<p>Click <a href="${link}">here</a> to verify your email.</p>`);
    return true;
  }

  // Verify email
  async verifyEmail({ token }: { token: string }) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { emailVerified: false }, select: ['id', 'email', 'emailVerified', 'emailVerificationToken', 'emailVerificationExpires'] });
    if (!user || (user as any).emailVerificationToken !== token) throw new Error('Invalid token');
    if ((user as any).emailVerificationExpires < new Date()) throw new Error('Token expired');
    user.emailVerified = true;
    (user as any).emailVerificationToken = null;
    (user as any).emailVerificationExpires = null;
    await userRepo.save(user);
    return true;
  }

  // Verify email using 6-character code
  async verifyEmailWithCode({ email, code }: { email: string; code: string }) {
    const userRepo = AppDataSource.getRepository(User);
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
    if (!user) throw new Error('User not found.');
    if (user.emailVerified) throw new Error('Email already verified.');
    if (!user.emailVerificationToken || !user.emailVerificationExpires) {
      throw new Error('No verification code found. Please request a new one.');
    }
    if (user.emailVerificationToken !== code) {
      throw new Error('Invalid verification code.');
    }
    if (user.emailVerificationExpires < new Date()) {
      throw new Error('Verification code expired.');
    }
    // Update user to verified
    await userRepo.update(user.id, {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });
    return true;
  }

  // Resend 6-character email verification code
  async resendVerificationCode({ email }: { email: string }) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) throw new Error('User not found.');
    if (user.emailVerified) throw new Error('Email already verified.');
    // Generate new 6-char code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let verificationCode = '';
    for (let i = 0; i < 6; i++) {
      verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 min expiry
    user.emailVerificationToken = verificationCode;
    user.emailVerificationExpires = expires;
    await userRepo.save(user);
    // Send verification email
    await sendEmail(
      email,
      'Verify your email',
      `<p>Your verification code is: <b>${verificationCode}</b></p>`
    );
    return true;
  }

  // Forgot password (send OTP)
  async forgotPassword({ email }: { email: string }) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email });
    if (!user) throw new Error('User not found');
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    (user as any).forgotPasswordOtp = otp;
    (user as any).forgotPasswordExpires = new Date(Date.now() + FORGOT_PASSWORD_EXPIRY_MINUTES * 60000);
    await userRepo.save(user);
    await sendEmail(email, 'Password Reset OTP', `<p>Your OTP is: <b>${otp}</b></p>`);
    return true;
  }

  // Reset password (verify OTP and update password)
  async resetPassword({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email });
    if (!user || (user as any).forgotPasswordOtp !== otp) throw new Error('Invalid OTP');
    if ((user as any).forgotPasswordExpires < new Date()) throw new Error('OTP expired');
    user.password = await hashPassword(newPassword);
    (user as any).forgotPasswordOtp = null;
    (user as any).forgotPasswordExpires = null;
    await userRepo.save(user);
    return true;
  }
}
