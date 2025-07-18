import jwt from 'jsonwebtoken';
import 'dotenv/config';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export function signJwt(payload: any, options?: jwt.SignOptions): string {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', ...(options || {}) });
}

export function verifyJwt(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}
