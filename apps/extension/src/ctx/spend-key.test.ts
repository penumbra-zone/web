import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  mockLocalExtStorage,
  mockSessionExtStorage,
} from '@penumbra-zone/storage/chrome/test-utils/mock';

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
  const sk0 = {
    inner: new Uint8Array([
      0xa0, 0xe1, 0x33, 0x3d, 0xbe, 0xee, 0xc2, 0x7f, 0x06, 0x11, 0x5c, 0x9d, 0x0c, 0x8a, 0xb2,
      0xc2, 0xf9, 0x23, 0xfa, 0x57, 0x67, 0x14, 0x8c, 0xa8, 0x36, 0xdc, 0x05, 0x17, 0xd0, 0x33,
      0xb3, 0xf6,
    ]),
  };

  const wallet0 = {
    label: 'mock',
    id: 'mock',
    fullViewingKey: 'mock',
    custody: {
      encryptedSeedPhrase: {
        cipherText:
          'di37XH8dpSbuBN9gwGB6hgAJycWVqozf3UB6O3mKTtimp8DsC0ZZRNEaf1hNi2Eu2pu1dF1f+vHAnisk3W4mRggAVUNtO0gvD8jcM0RhzGVEZnUlZuRR1TtoQDFXzmo=',
        nonce: 'MUyDW2GHSeZYVF4f',
      },
    },
  };

  const pw = {
    _inner: {
      alg: 'A256GCM',
      ext: true,
      k: '2l2K1HKpGWaOriS58zwdDTwAMtMuczuUQc4IYzGxyhM',
      kty: 'oct',
      key_ops: ['encrypt', 'decrypt'],
    },
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    await localExtStorage.set('wallets', [wallet0]);
    await sessionExtStorage.set('passwordKey', pw);
  });

  test('should successfully get the correct spend key', () =>
    expect(getSpendKey()).resolves.toMatchObject(sk0));

  test('should fail if no wallet is present', async () => {
    await localExtStorage.set('wallets', []);
    await expect(getSpendKey()).rejects.toThrow('No wallet found');
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
    await expect(getSpendKey()).rejects.toThrow('Unable to decrypt seed phrase');
  });
});
