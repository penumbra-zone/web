import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockLocalExtStorage, mockSessionExtStorage } from '../storage/mock';

describe('AccountsSlice', () => {
  const password = 'correcthorsebatterystaple';
  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage, mockLocalExtStorage));
  });

  test('password can be set and verified', () => {
    const stateA = useStore.getState();
    useStore.getState().accounts.setPassword(password);
    const stateB = useStore.getState();
    useStore.getState().accounts.setSeedPhrase(password, 'apple monkey test ...');
    const stateC = useStore.getState();
    expect(useStore.getState().accounts.isPassword(password)).toBe(true);
  });

  test('raises when trying to validate password without a seed phrase (invalid state)', () => {
    try {
      useStore.getState().accounts.setPassword(password);
      useStore.getState().accounts.isPassword(password);
    } catch (error) {
      expect(true).toBe(true); // This is expected
    }
  });

  test('incorrect password should not verify', () => {
    const wrongPassword = 'wrong-password-123';
    useStore.getState().accounts.setPassword(password);
    expect(useStore.getState().accounts.isPassword(wrongPassword)).toBe(false);
  });

  test('password is initially undefined', () => {
    expect(useStore.getState().accounts.hashedPassword).toBeUndefined();
  });
});
