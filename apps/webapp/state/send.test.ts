import { beforeEach, describe, expect, test } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';

describe('Send Slice', () => {
  const asset = {
    name: 'BNB 1',
    icon: '/test-asset-icon-2.svg',
    balance: 1,
  };

  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore());
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().send.amount).toBe('');
    expect(useStore.getState().send.memo).toBe('');
    expect(useStore.getState().send.recepient).toBe('');
    expect(useStore.getState().send.hidden).toBeFalsy();
    expect(useStore.getState().send.asset).toBeUndefined();
    expect(useStore.getState().send.validationErrors.amount).toBeFalsy();
    expect(useStore.getState().send.validationErrors.recepient).toBeFalsy();
  });

  describe('setAmount', () => {
    test('amount can be set', () => {
      useStore.getState().send.setAmount('2');
      expect(useStore.getState().send.amount).toBe('2');
    });

    test('validate amount is falsy', () => {
      useStore.getState().send.setAsset(asset);
      useStore.getState().send.setAmount('1');
      expect(useStore.getState().send.amount).toBe('1');
      expect(useStore.getState().send.validationErrors.amount).toBeFalsy();
    });

    test('validate amount is truthy when the quantity exceeds the balance of the asset', () => {
      useStore.getState().send.setAsset(asset);
      useStore.getState().send.setAmount('2');
      expect(useStore.getState().send.amount).toBe('2');
      expect(useStore.getState().send.validationErrors.amount).toBeTruthy();
    });

    test('validate amount is falsy when an asset with a higher balance has changed', () => {
      const asset2 = {
        name: 'BNB 1',
        icon: '/test-asset-icon-2.svg',
        balance: 2,
      };

      useStore.getState().send.setAsset(asset);
      useStore.getState().send.setAmount('2');
      expect(useStore.getState().send.amount).toBe('2');
      expect(useStore.getState().send.validationErrors.amount).toBeTruthy();

      // change asset with higher balance
      useStore.getState().send.setAsset(asset2);
      expect(useStore.getState().send.amount).toBe('2');
      expect(useStore.getState().send.validationErrors.amount).toBeFalsy();
    });
  });

  describe('setMemo', () => {
    test('memo can be set', () => {
      useStore.getState().send.setMemo('memo-test');
      expect(useStore.getState().send.memo).toBe('memo-test');
    });
  });

  describe('setHidden', () => {
    test('hidden after click has true value', () => {
      useStore.getState().send.setHidden(true);
      expect(useStore.getState().send.hidden).toBeTruthy();
    });

    test('false value after 2 click', () => {
      useStore.getState().send.setHidden(true);
      expect(useStore.getState().send.hidden).toBeTruthy();
      useStore.getState().send.setHidden(false);
      expect(useStore.getState().send.hidden).toBeFalsy();
    });
  });

  describe('setRecepient and validate', () => {
    const rightAddress =
      'penumbrav2t1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6ppc4';

    test('recepient can be set and validate', () => {
      useStore.getState().send.setRecepient(rightAddress);
      expect(useStore.getState().send.recepient).toBe(rightAddress);
      expect(useStore.getState().send.validationErrors.recepient).toBeFalsy();
    });

    test('recepient will have a validation error after entering an incorrect address length', () => {
      const badAddressLength =
        'penumbrav2t1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd';

      useStore.getState().send.setRecepient(badAddressLength);
      expect(useStore.getState().send.validationErrors.recepient).toBeTruthy();
    });

    test('recepient will have a validation error after entering an address without penumbrav2t as prefix', () => {
      const badAddressPrefix =
        'wwwwwwwwww1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6ppc4d';

      useStore.getState().send.setRecepient(badAddressPrefix);
      expect(useStore.getState().send.validationErrors.recepient).toBeTruthy();
    });
  });

  describe('setAsset', () => {
    test('asset can be set', () => {
      useStore.getState().send.setAsset(asset);
      expect(useStore.getState().send.asset).toBe(asset);
    });
  });
});
