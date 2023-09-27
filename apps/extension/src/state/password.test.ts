import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { mockLocalExtStorage, mockSessionExtStorage } from '../storage/mock';
import { ExtensionStorage } from '../storage/base';
import { SessionStorageState } from '../storage/session';
import { LocalStorageState } from '../storage/local';
import { encrypt, isPassword, randomSalt } from 'penumbra-crypto-ts';
import { webcrypto } from 'crypto';

vi.stubGlobal('crypto', webcrypto);

describe('Password Slice', () => {
  const password = 's0meUs3rP@ssword';
  const seedPhrase = 'correct horse battery staple';

  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let sessionStorage: ExtensionStorage<SessionStorageState>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    sessionStorage = mockSessionExtStorage();
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(sessionStorage, localStorage));
  });

  test('password cannot be verified without a wallet', async () => {
    await useStore.getState().password.setPassword(password);
    await expect(useStore.getState().password.isPassword(password)).rejects.toThrow();
  });

  test('password can be set and verified', async () => {
    const hashed = await useStore.getState().password.setPassword(password);
    const iv = randomSalt();
    const encryptedSeedPhrase = await encrypt(seedPhrase, iv, hashed.key);
    await useStore.getState().wallets.addWallet({
      label: 'Account #1',
      encryptedSeedPhrase,
      initializationVector: iv,
      fullViewingKey: '1234',
    });
    // Slice method works
    expect(await isPassword(password, hashed.salt, encryptedSeedPhrase, iv)).toBeTruthy();
    expect(await useStore.getState().password.isPassword(password)).toBeTruthy();

    // Session stored hash is validated
    const sessionStoredHash = await sessionStorage.get('hashedPassword');
    expect(
      await isPassword(password, sessionStoredHash!.salt, encryptedSeedPhrase, iv),
    ).toBeTruthy();

    // Locally stored salt is validated
    const localStoredSalt = await localStorage.get('passwordSalt');
    expect(localStoredSalt).toBeDefined();
    expect(await isPassword(password, localStoredSalt!, encryptedSeedPhrase, iv)).toBeTruthy();
  });

  test('incorrect password should not verify', async () => {
    const hashed = await useStore.getState().password.setPassword(password);
    const iv = randomSalt();
    const encryptedSeedPhrase = await encrypt(seedPhrase, iv, hashed.key);
    await useStore.getState().wallets.addWallet({
      label: 'Account #1',
      encryptedSeedPhrase,
      initializationVector: iv,
      fullViewingKey: '1234',
    });

    const wrongPassword = 'wrong-password-123';
    expect(await useStore.getState().password.isPassword(wrongPassword)).toBe(false);
  });

  test('password is initially undefined', () => {
    expect(useStore.getState().password.hashedPassword).toBeUndefined();
  });
});
