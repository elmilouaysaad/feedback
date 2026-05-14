import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

function isPlaceholderHash(value: string): boolean {
  return /your_bcrypt_hash_here|replace_with_bcrypt_hash|bcrypt_hash|placeholder/i.test(value);
}

// Hash password (one-time setup)
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload: { role: string; iat?: number }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Verify JWT token
export function verifyToken(token: string): { role: string; iat: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; iat: number };
    return decoded;
  } catch {
    return null;
  }
}

// Get admin password hash (for initial setup)
export function getAdminPasswordHash(password: string): Promise<string> {
  return hashPassword(password);
}

// Verify admin login
export async function verifyAdminLogin(password: string): Promise<boolean> {
  const adminHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (adminHash && isBcryptHash(adminHash) && !isPlaceholderHash(adminHash)) {
    return verifyPassword(password, adminHash);
  }

  return password === DEFAULT_ADMIN_PASSWORD;
}
