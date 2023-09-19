import { describe, expect, test, vi } from 'vitest';
import { decrypt, encrypt, hashPassword, isPassword, random128Bits } from './encryption';
import { webcrypto } from 'crypto';

vi.stubGlobal('crypto', webcrypto);

describe('encryption', () => {
  const password = 's0meUs3rP@ssword';
  const seedPhrase = 'correct horse battery staple';

  test('random128Bits returns Uint8Array of length 16', () => {
    const result = random128Bits();
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(16);
  });

  test('encrypt and decrypt provide lossless round-trip', async () => {
    const salt = random128Bits();
    const key = await hashPassword(password, salt);

    const initializationVector = random128Bits();
    const encrypted = await encrypt(seedPhrase, initializationVector, key);
    const decrypted = await decrypt(encrypted, initializationVector, key);
    expect(decrypted).toBe(seedPhrase);
  });

  test('isPassword correctly verifies password', async () => {
    const salt = random128Bits();
    const key = await hashPassword(password, salt);

    const initializationVector = random128Bits();
    const encrypted = await encrypt(seedPhrase, initializationVector, key);
    const isPasswordCorrect = await isPassword(password, salt, encrypted, initializationVector);

    expect(isPasswordCorrect).toBe(true);
  });

  test('isPassword correctly rejects incorrect password', async () => {
    const salt = random128Bits();
    const key = await hashPassword(password, salt);
    const initializationVector = random128Bits();

    const encrypted = await encrypt(seedPhrase, initializationVector, key);
    const isPasswordCorrect = await isPassword(
      'WrongP@ssw0rd',
      salt,
      encrypted,
      initializationVector,
    );

    expect(isPasswordCorrect).toBe(false);
  });

  test('decrypt correctly rejects wrong initialization vector', async () => {
    const salt = random128Bits();
    const key = await hashPassword(password, salt);
    const initializationVector = random128Bits();
    const encrypted = await encrypt(seedPhrase, initializationVector, key);
    const wrongInitializationVector = random128Bits();
    try {
      await decrypt(encrypted, wrongInitializationVector, key);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('decrypt correctly rejects wrong CryptoKey', async () => {
    const salt = random128Bits();
    const key = await hashPassword(password, salt);
    const wrongKey = await hashPassword('wrongPassword', salt);
    const initializationVector = random128Bits();
    const encrypted = await encrypt(seedPhrase, initializationVector, key);
    try {
      await decrypt(encrypted, initializationVector, wrongKey);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
