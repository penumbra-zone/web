import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { webcrypto } from 'crypto';
import {
  ExtensionStorage,
  LocalStorageState,
  mockLocalExtStorage,
  mockSessionExtStorage,
  SessionStorageState,
} from '@penumbra-zone/storage';

vi.stubGlobal('crypto', webcrypto);
vi.mock('@penumbra-zone/wasm-ts', () => ({
  generateSpendKey: () => 'spend_key',
  getFullViewingKey: () => 'full_viewing_key',
}));

describe('Accounts Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let sessionStorage: ExtensionStorage<SessionStorageState>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    sessionStorage = mockSessionExtStorage();
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(sessionStorage, localStorage));
  });

  test('index starts at 0', () => {
    expect(useStore.getState().accounts.index).toBe(0);
    expect(useStore.getState().accounts.ephemeral).toBeFalsy();
  });

  test('can increment correctly', () => {
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    expect(useStore.getState().accounts.index).toBe(3);
  });

  test('can can decrement correctly', () => {
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    useStore.getState().accounts.next();
    useStore.getState().accounts.previous();
    useStore.getState().accounts.previous();
    expect(useStore.getState().accounts.index).toBe(3);
  });

  test('can be set index', () => {
    useStore.getState().accounts.setIndex(100000);
    expect(useStore.getState().accounts.index).toBe(100000);
  });

  test('check index after set and decrement', () => {
    useStore.getState().accounts.setIndex(100);
    useStore.getState().accounts.previous();
    expect(useStore.getState().accounts.index).toBe(99);
  });

  test('check index after set and incremetn', () => {
    useStore.getState().accounts.setIndex(100);
    useStore.getState().accounts.next();
    expect(useStore.getState().accounts.index).toBe(101);
  });

  test('cannot go below zero', () => {
    useStore.getState().accounts.previous();
    useStore.getState().accounts.previous();
    useStore.getState().accounts.previous();
    useStore.getState().accounts.previous();
    expect(useStore.getState().accounts.index).toBe(0);
  });

  test('ephemeral can be set', () => {
    const previous = useStore.getState().accounts.ephemeral;
    expect(previous).toBeFalsy();
    useStore.getState().accounts.setEphemeral(true);

    expect(useStore.getState().accounts.ephemeral).toBeTruthy();
  });
});
