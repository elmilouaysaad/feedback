import { promises as fs } from 'fs';
import path from 'path';

const PASSWORD_HASH_FILE = path.join(process.cwd(), '.password-hash');

/**
 * Read the password hash from file
 * Falls back to environment variable if file doesn't exist
 */
export async function readPasswordHashFromFile(): Promise<string | null> {
  try {
    const data = await fs.readFile(PASSWORD_HASH_FILE, 'utf-8');
    return data.trim();
  } catch (error) {
    // File doesn't exist, fall back to env var
    return null;
  }
}

/**
 * Write the password hash to file
 */
export async function writePasswordHashToFile(hash: string): Promise<void> {
  try {
    await fs.writeFile(PASSWORD_HASH_FILE, hash, 'utf-8');
  } catch (error) {
    console.error('Failed to write password hash to file:', error);
    throw new Error('Failed to save password hash');
  }
}

/**
 * Get the current password hash (file first, then env var)
 */
export async function getPasswordHash(): Promise<string | null> {
  // Try to read from file first
  const fileHash = await readPasswordHashFromFile();
  if (fileHash) {
    return fileHash;
  }

  // Fall back to environment variable
  return process.env.ADMIN_PASSWORD_HASH?.trim() || null;
}

/**
 * Check if password hash file exists
 */
export async function passwordHashFileExists(): Promise<boolean> {
  try {
    await fs.access(PASSWORD_HASH_FILE);
    return true;
  } catch {
    return false;
  }
}
