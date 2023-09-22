import { describe, expect, test, vi } from 'vitest';
import { decrypt, encrypt, hashPassword, isPassword, randomBase64str } from './encryption';
import { webcrypto } from 'crypto';
import { Base64StringSchema, validateSchema } from 'penumbra-types';

vi.stubGlobal('crypto', webcrypto);

describe('encryption', () => {
  const password = 's0meUs3rP@ssword';
  const seedPhrase = 'correct horse battery staple';

  test('encrypt and decrypt provide lossless round-trip', async () => {
    const salt = randomBase64str();
    const key = await hashPassword(password, salt);

    const initializationVector = randomBase64str();
    const encrypted = await encrypt(seedPhrase, initializationVector, key);
    const decrypted = await decrypt(encrypted, initializationVector, key);
    expect(decrypted).toBe(seedPhrase);
  });

  test('isPassword correctly verifies password', async () => {
    const salt = randomBase64str();
    const key = await hashPassword(password, salt);

    const initializationVector = randomBase64str();
    const encrypted = await encrypt(seedPhrase, initializationVector, key);
    const isPasswordCorrect = await isPassword(password, salt, encrypted, initializationVector);

    expect(isPasswordCorrect).toBe(true);
  });

  test('isPassword correctly rejects incorrect password', async () => {
    const salt = randomBase64str();
    const key = await hashPassword(password, salt);
    const initializationVector = randomBase64str();

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
    const salt = randomBase64str();
    const key = await hashPassword(password, salt);
    const initializationVector = randomBase64str();
    const encrypted = await encrypt(seedPhrase, initializationVector, key);
    const wrongInitializationVector = randomBase64str();
    try {
      await decrypt(encrypted, wrongInitializationVector, key);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('decrypt correctly rejects wrong CryptoKey', async () => {
    const salt = randomBase64str();
    const key = await hashPassword(password, salt);
    const wrongKey = await hashPassword('wrongPassword', salt);
    const initializationVector = randomBase64str();
    const encrypted = await encrypt(seedPhrase, initializationVector, key);
    try {
      await decrypt(encrypted, initializationVector, wrongKey);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('should return a JSON serializable key', async () => {
    const salt = randomBase64str();
    const key = await hashPassword(password, salt);
    expect(JSON.parse(JSON.stringify(key))).not.toEqual({});
  });

  test('salt should be a base64 string', () => {
    const salt = randomBase64str();
    expect(() => validateSchema(Base64StringSchema, salt)).not.toThrow();
  });

  test('Hash algorithm should not have changed', async () => {
    const salt = '+VzsTs4/j3wZct7oaDhHOg==';
    const key = await hashPassword(password, salt);
    expect(key).toMatchSnapshot();
  });
});
