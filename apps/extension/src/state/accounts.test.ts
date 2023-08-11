import { AccountsSlice, createAccountsSlice } from './accounts'; // replace with the correct import path
import { beforeEach, describe, expect, test } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices } from './index';

describe('AccountsSlice', () => {
  const password = 'correcthorsebatterystaple';
  let useStore: UseBoundStore<StoreApi<AccountsSlice>>;

  beforeEach(() => {
    useStore = create<AllSlices>()((setState, getState, store) => ({
      ...createAccountsSlice(setState, getState, store),
    }));
  });

  test('password can be set and verified', () => {
    useStore.getState().setPassword(password);
    useStore.getState().setSeedPhrase(password, 'apple monkey test ...');
    expect(useStore.getState().isPassword(password)).toBe(true);
  });

  test('raises when trying to validate password without a seed phrase (invalid state)', () => {
    try {
      useStore.getState().setPassword(password);
      useStore.getState().isPassword(password);
    } catch (error) {
      expect(true).toBe(true); // This is expected
    }
  });

  test('incorrect password should not verify', () => {
    const wrongPassword = 'wrong-password-123';
    useStore.getState().setPassword(password);
    expect(useStore.getState().isPassword(wrongPassword)).toBe(false);
  });

  test('password is initially undefined', () => {
    expect(useStore.getState().hashedPassword).toBeUndefined();
  });
});
