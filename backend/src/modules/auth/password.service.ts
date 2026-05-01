import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const prefix = 'scrypt';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${prefix}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split('$');

  if (algorithm !== prefix || !salt || !hash) {
    return false;
  }

  const actual = Buffer.from(hash, 'hex');
  const expected = scryptSync(password, salt, 64);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
