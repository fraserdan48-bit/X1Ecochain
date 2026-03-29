// Encryption utility for sensitive data like seed phrases
// Uses crypto-js for AES encryption

const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-demo-key-change-in-production';

/**
 * Encrypt a seed phrase before storage
 * @param {string} seedPhrase - The seed phrase to encrypt
 * @returns {string} - Encrypted seed phrase (base64)
 */
export function encryptSeedPhrase(seedPhrase) {
  try {
    const encrypted = CryptoJS.AES.encrypt(seedPhrase, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (e) {
    console.error('[encryption] encrypt error', e);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt a seed phrase (server-side only, for admin access)
 * @param {string} encryptedPhrase - Encrypted seed phrase
 * @returns {string} - Decrypted seed phrase
 */
export function decryptSeedPhrase(encryptedPhrase) {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedPhrase, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (e) {
    console.error('[encryption] decrypt error', e);
    throw new Error('Decryption failed');
  }
}
