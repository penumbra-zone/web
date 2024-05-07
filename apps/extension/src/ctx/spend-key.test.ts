import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  mockLocalExtStorage,
  mockSessionExtStorage,
} from '@penumbra-zone/storage/chrome/test-utils/mock';
import { SpendKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

const localExtStorage = mockLocalExtStorage();
const sessionExtStorage = mockSessionExtStorage();

vi.doMock('@penumbra-zone/storage/chrome/local', async importOriginal => {
  const mod = await importOriginal<typeof import('@penumbra-zone/storage/chrome/local')>();
  return {
    ...mod,
    localExtStorage,
  };
});

vi.doMock('@penumbra-zone/storage/chrome/session', async importOriginal => {
  const mod = await importOriginal<typeof import('@penumbra-zone/storage/chrome/session')>();
  return {
    ...mod,
    sessionExtStorage,
  };
});

// needs to be imported after storage mocks are set up
const { getSpendKey } = await import('./spend-key');

describe('Authorize request handler', () => {
  beforeEach(async () => {
    vi.resetAllMocks();

    await localExtStorage.set('wallets', [
      {
        label: 'mock',
        id: 'mock',
        custody: {
          encryptedSeedPhrase: {
            cipherText:
              'di37XH8dpSbuBN9gwGB6hgAJycWVqozf3UB6O3mKTtimp8DsC0ZZRNEaf1hNi2Eu2pu1dF1f+vHAnisk3W4mRggAVUNtO0gvD8jcM0RhzGVEZnUlZuRR1TtoQDFXzmo=',
            nonce: 'MUyDW2GHSeZYVF4f',
          },
        },
        fullViewingKey:
          'penumbrafullviewingkey1f33fr3zrquh869s3h8d0pjx4fpa9fyut2utw7x5y7xdcxz6z7c8sgf5hslrkpf3mh8d26vufsq8y666chx0x0su06ay3rkwu74zuwqq9w8aza',
      },
    ]);

    await sessionExtStorage.set('passwordKey', {
      _inner: {
        alg: 'A256GCM',
        ext: true,
        k: '2l2K1HKpGWaOriS58zwdDTwAMtMuczuUQc4IYzGxyhM',
        kty: 'oct',
        key_ops: ['encrypt', 'decrypt'],
      },
    });
  });

  test('should successfully get a spend key', async () => {
    await expect(getSpendKey()).resolves.toSatisfy(
      value =>
        value instanceof SpendKey &&
        value.equals({
          inner: new Uint8Array([
            160, 225, 51, 61, 190, 238, 194, 127, 6, 17, 92, 157, 12, 138, 178, 194, 249, 35, 250,
            87, 103, 20, 140, 168, 54, 220, 5, 23, 208, 51, 179, 246,
          ]),
        }),
    );
  });

  test('should fail if user is not logged in extension', async () => {
    await sessionExtStorage.set('passwordKey', undefined);
    await expect(getSpendKey()).rejects.toThrow('User must login');
  });

  test('should fail if incorrect password is used', async () => {
    await sessionExtStorage.set('passwordKey', {
      _inner: {
        alg: 'A256GCM',
        ext: true,
        k: '1l2K1HKpGWaOriS58zwdDTwAMtMuczuUQc4IYzGxyhN',
        kty: 'oct',
        key_ops: ['encrypt', 'decrypt'],
      },
    });
    await expect(getSpendKey()).rejects.toThrow('Unable to decrypt');
  });
});
