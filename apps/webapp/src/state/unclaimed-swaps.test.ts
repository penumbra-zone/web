import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index';
import { beforeEach, describe, expect, test } from 'vitest';

describe('Unclaimed Swaps Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
  });

  test('the default in progress list is empty', () => {
    expect(useStore.getState().unclaimedSwaps.inProgress.length).toBe(0);
  });

  test('adding to status list works as expected', () => {
    const setStatus = useStore.getState().unclaimedSwaps.setProgressStatus;
    setStatus('add', '123');
    expect(useStore.getState().unclaimedSwaps.inProgress.length).toBe(1);
    setStatus('add', '456');
    expect(useStore.getState().unclaimedSwaps.inProgress.length).toBe(2);
    expect(useStore.getState().unclaimedSwaps.isInProgress('123')).toBeTruthy();
    expect(useStore.getState().unclaimedSwaps.isInProgress('456')).toBeTruthy();
  });

  test('adds only once', () => {
    const setStatus = useStore.getState().unclaimedSwaps.setProgressStatus;
    setStatus('add', '123');
    setStatus('add', '123');
    setStatus('add', '123');
    expect(useStore.getState().unclaimedSwaps.inProgress.length).toBe(1);
  });

  test('removing from list works', () => {
    const setStatus = useStore.getState().unclaimedSwaps.setProgressStatus;
    setStatus('add', '123');
    setStatus('add', '456');
    expect(useStore.getState().unclaimedSwaps.inProgress.length).toBe(2);
    setStatus('remove', '123');
    expect(useStore.getState().unclaimedSwaps.inProgress.length).toBe(1);
    expect(useStore.getState().unclaimedSwaps.isInProgress('123')).toBeFalsy();
    expect(useStore.getState().unclaimedSwaps.isInProgress('456')).toBeTruthy();
  });

  test('removing multiple times does nothing', () => {
    const setStatus = useStore.getState().unclaimedSwaps.setProgressStatus;
    setStatus('add', '123');
    expect(useStore.getState().unclaimedSwaps.inProgress.length).toBe(1);
    setStatus('remove', '123');
    setStatus('remove', '123');
    setStatus('remove', '123');
    expect(useStore.getState().unclaimedSwaps.inProgress.length).toBe(0);
  });
});
