import jwt from 'jsonwebtoken';
import 'dotenv/config';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export function signJwt(payload: Record<string, unknown>, options?: jwt.SignOptions): string {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', ...(options || {}) });
}

export function verifyJwt(token: string): Record<string, unknown> | null {
  try {
    return jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
  } catch {
    return null;
  }
}
