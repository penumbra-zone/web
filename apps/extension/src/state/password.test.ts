import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockLocalExtStorage, mockSessionExtStorage } from '../storage/mock';
import { ExtensionStorage } from '../storage/base';
import { SessionStorageState } from '../storage/session';
import { LocalStorageState } from '../storage/local';
import { repeatedHash } from 'penumbra-crypto-ts';

describe('Password Slice', () => {
  const password = 'correcthorsebatterystaple';
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let sessionStorage: ExtensionStorage<SessionStorageState>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    sessionStorage = mockSessionExtStorage();
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(sessionStorage, localStorage));
  });

  test('password can be set and verified', async () => {
    const hashed = useStore.getState().password.setPassword(password);
    expect(hashed).toBe(repeatedHash(password));
    expect(await useStore.getState().password.isPassword(password)).toBe(true);
    expect(await sessionStorage.get('hashedPassword')).toBe(repeatedHash(password));
    expect(await localStorage.get('hashedPassword')).toBe(repeatedHash(password));
  });

  test('password can be removed', async () => {
    useStore.getState().password.setPassword(password);
    useStore.getState().password.clearPassword();
    expect(await useStore.getState().password.isPassword(password)).toBe(false);

    expect(await sessionStorage.get('hashedPassword')).toBeUndefined();
    expect(await localStorage.get('hashedPassword')).toBeUndefined();
  });

  test('incorrect password should not verify', async () => {
    const wrongPassword = 'wrong-password-123';
    useStore.getState().password.setPassword(password);
    expect(await useStore.getState().password.isPassword(wrongPassword)).toBe(false);
  });

  test('password is initially undefined', () => {
    expect(useStore.getState().password.hashedPassword).toBeUndefined();
  });
});
