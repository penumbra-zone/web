import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from '.';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Key, KeyPrint } from '@penumbra-zone/crypto-web/src/encryption';
import { webcrypto } from 'crypto';
import { LocalStorageState } from '@penumbra-zone/storage/src/chrome/local';
import { ExtensionStorage } from '@penumbra-zone/storage/src/chrome/base';
import {
  mockLocalExtStorage,
  mockSessionExtStorage,
} from '@penumbra-zone/storage/src/chrome/test-utils/mock';
import { SessionStorageState } from '@penumbra-zone/storage/src/chrome/session';

vi.stubGlobal('crypto', webcrypto);

describe('Password Slice', () => {
  const password = 's0meUs3rP@ssword';
  const seedPhrase = [
    'advance twist canal impact field normal depend pink sick horn world broccoli',
  ];

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

  test('password key can be set to session storage', async () => {
    await useStore.getState().password.setPassword(password);
    await useStore.getState().wallets.addWallet({
      label: 'Account #1',
      seedPhrase,
    });

    useStore.getState().password.clearSessionPassword();
    const sessionKeyAfterLogout = await sessionStorage.get('passwordKey');
    expect(sessionKeyAfterLogout).toBeFalsy();

    await useStore.getState().password.setSessionPassword(password);

    const sessionKeyAfterLogin = await sessionStorage.get('passwordKey');
    expect(sessionKeyAfterLogin).toBeTruthy();
    await expect(Key.fromJson(sessionKeyAfterLogin!)).resolves.not.toThrow();
  });
});
