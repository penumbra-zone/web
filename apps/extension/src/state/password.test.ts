import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Key, KeyPrint } from 'penumbra-crypto-ts';
import { webcrypto } from 'crypto';
import {
  ExtensionStorage,
  LocalStorageState,
  mockLocalExtStorage,
  mockSessionExtStorage,
  SessionStorageState,
} from 'penumbra-storage';

vi.stubGlobal('crypto', webcrypto);

vi.mock('penumbra-wasm-ts', () => ({
  generateSpendKey: () => 'spend_key',
  getFullViewingKey: () => 'full_viewing_key',
  getWalletId: () => 'wallet_id',
}));

describe('Password Slice', () => {
  const password = 's0meUs3rP@ssword';
  const seedPhrase = ['correct horse battery staple'];

  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let sessionStorage: ExtensionStorage<SessionStorageState>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    sessionStorage = mockSessionExtStorage();
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(sessionStorage, localStorage));
  });

  test('password cannot be verified without a KeyPrint', async () => {
    await expect(useStore.getState().password.isPassword(password)).rejects.toThrow();
  });

  test('password can be set and verified', async () => {
    await useStore.getState().password.setPassword(password);
    await useStore.getState().wallets.addWallet({
      label: 'Account #1',
      seedPhrase,
    });

    // Saves to session storage
    const sessionKey = await sessionStorage.get('passwordKey');
    expect(sessionKey).toBeTruthy();
    await expect(Key.fromJson(sessionKey!)).resolves.not.toThrow();

    // Saves to local storage
    const localPrint = await localStorage.get('passwordKeyPrint');
    expect(localPrint).toBeTruthy();
    expect(() => KeyPrint.fromJson(localPrint!)).not.toThrow();

    // Slice method works
    expect(await useStore.getState().password.isPassword(password)).toBeTruthy();
    expect(await useStore.getState().password.isPassword('wrong password')).toBeFalsy();
  });

  test('password key is initially undefined', () => {
    expect(useStore.getState().password.key).toBeUndefined();
  });
});
