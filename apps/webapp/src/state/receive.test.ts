import { beforeEach, describe, expect, test } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';

describe('Receive Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore());
  });

  test('index starts at 0', () => {
    expect(useStore.getState().receive.index).toBe(0);
    expect(useStore.getState().receive.ephemeral).toBeFalsy();
  });

  test('can increment correctly', () => {
    useStore.getState().receive.next();
    useStore.getState().receive.next();
    useStore.getState().receive.next();
    expect(useStore.getState().receive.index).toBe(3);
  });

  test('can can decrement correctly', () => {
    useStore.getState().receive.next();
    useStore.getState().receive.next();
    useStore.getState().receive.next();
    useStore.getState().receive.next();
    useStore.getState().receive.next();
    useStore.getState().receive.previous();
    useStore.getState().receive.previous();
    expect(useStore.getState().receive.index).toBe(3);
  });

  test('cannot go below zero', () => {
    useStore.getState().receive.previous();
    useStore.getState().receive.previous();
    useStore.getState().receive.previous();
    useStore.getState().receive.previous();
    expect(useStore.getState().receive.index).toBe(0);
  });

  test('ephemeral can be set', () => {
    const previous = useStore.getState().receive.ephemeral;
    expect(previous).toBeFalsy();
    useStore.getState().receive.setEphemeral(true);

    expect(useStore.getState().receive.ephemeral).toBeTruthy();
  });
});
