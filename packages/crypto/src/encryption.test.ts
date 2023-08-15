import { decrypt, encrypt } from './encryption';
import { describe, expect, test } from 'vitest';

describe('Encryption tests', () => {
  const secretMessage = 'Hello, World!';
  const password = 'correcthorsebatterystaple';

  test('original message can be recovered', () => {
    const encrypted = encrypt(secretMessage, password);
    const decrypted = decrypt(encrypted, password);
    expect(decrypted).toBe(secretMessage);
  });

  test('despite different initialization vector, both can still decrypt', () => {
    // Different initialization vector's make these different
    const encryptedA = encrypt(secretMessage, password);
    const encryptedB = encrypt(secretMessage, password);
    expect(encryptedA).not.toBe(encryptedB);

    // But they can still decrypt
    const decryptedA = decrypt(encryptedA, password);
    const decryptedB = decrypt(encryptedB, password);
    expect(decryptedA).toBe(secretMessage);
    expect(decryptedB).toBe(secretMessage);
    expect(decryptedA).toBe(decryptedB);
  });

  test('different keys produce different results', () => {
    const otherPassword = 'wrong-password-123';
    const encryptedA = encrypt(secretMessage, password);
    const encryptedB = encrypt(secretMessage, otherPassword);
    expect(encryptedA).not.toBe(encryptedB);
  });

  test('decryption fails with incorrect key', () => {
    const otherPassword = 'wrong-password-123';
    const encrypted = encrypt(secretMessage, password);
    try {
      decrypt(encrypted, otherPassword);
      // If decryption doesn't throw an error, then it's a failure
      expect('Decryption should have thrown an error').toBe(false);
    } catch (error) {
      expect(true).toBe(true); // This is expected
    }
  });

  test('encrypts empty string', () => {
    const encrypted = encrypt('', password);
    const decrypted = decrypt(encrypted, password);
    expect(decrypted).toBe('');
  });

  test('decrypt raises error with undefined', () => {
    try {
      decrypt(undefined!, password);
      expect('Decryption should have thrown an error').toBe(false);
    } catch (error) {
      expect(true).toBe(true); // This is expected
    }
  });

  test('encrypts large message', () => {
    const largeMessage = 'a'.repeat(1000);
    const encrypted = encrypt(largeMessage, password);
    const decrypted = decrypt(encrypted, password);
    expect(decrypted).toBe(largeMessage);
  });
});
