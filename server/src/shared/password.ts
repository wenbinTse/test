import Config from './config';
import { Password } from './interface';

const crypto = require('crypto');

/**
 * Generates hash and salt
 * @param {string} password password
 * @returns {Password} hash and salt
 */
export function createHashAndSalt(password: string): Password {
  const salt: string = crypto.randomBytes(64).toString('base64');
  const hash = crypto.pbkdf2Sync(password, salt, Config.hashIterationNum, Config.keyLength, 'sha512')
    .toString('hex');
  return {hash, salt};
}

/**
 * Verifies that the password is correct.
 * @param password The password which user inputs.
 * @param salt The salt in datebase.
 * @param hash The hash in datebase.
 * @returns {boolean} True if password is correct, false otherwise.
 */
export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const correctHash = crypto.pbkdf2Sync(password, salt, Config.hashIterationNum, Config.keyLength, 'sha512')
    .toString('hex');
  return hash === correctHash;
}
