import { beforeEach, describe, expect, test } from 'vitest';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { AllSlices, initializeStore } from '.';

describe('Send Slice', () => {
  const asset = {
    inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
    altBaseDenom: '',
    altBech32: '',
  };

  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore());
  });

  test('the default is empty, false or undefined', () => {
    expect(useStore.getState().send.amount).toBe('');
    expect(useStore.getState().send.memo).toBe('');
    expect(useStore.getState().send.recipient).toBe('');
    expect(useStore.getState().send.hidden).toBeFalsy();
    expect(useStore.getState().send.asset).toBeTruthy();
    expect(useStore.getState().send.validationErrors.amount).toBeFalsy();
    expect(useStore.getState().send.validationErrors.recipient).toBeFalsy();
    expect(useStore.getState().send.assetBalance).toBe(0);
  });

  describe('setAmount', () => {
    test('amount can be set', () => {
      useStore.getState().send.setAmount('2');
      expect(useStore.getState().send.amount).toBe('2');
    });

    test('validate amount is falsy', () => {
      useStore.getState().send.setAsset(asset);
      useStore.getState().send.setAssetBalance(2);
      useStore.getState().send.setAmount('1');
      expect(useStore.getState().send.validationErrors.amount).toBeFalsy();
    });

    test('validate amount is truthy when the quantity exceeds the balance of the asset', () => {
      useStore.getState().send.setAsset(asset);
      useStore.getState().send.setAssetBalance(2);
      useStore.getState().send.setAmount('6');
      expect(useStore.getState().send.validationErrors.amount).toBeTruthy();
    });

    test('validate amount is falsy when an asset with a higher balance has changed', () => {
      const asset2 = {
        inner: '6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws=',
        altBaseDenom: '',
        altBech32: '',
      };

      useStore.getState().send.setAsset(asset);
      useStore.getState().send.setAssetBalance(1);
      useStore.getState().send.setAmount('2');
      expect(useStore.getState().send.validationErrors.amount).toBeTruthy();

      // change asset with higher balance
      useStore.getState().send.setAsset(asset2);
      useStore.getState().send.setAssetBalance(100);
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

  describe('setRecipient and validate', () => {
    const rightAddress =
      'penumbra1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6ppc4';

    test('recipient can be set and validate', () => {
      useStore.getState().send.setRecipient(rightAddress);
      expect(useStore.getState().send.recipient).toBe(rightAddress);
      expect(useStore.getState().send.validationErrors.recipient).toBeFalsy();
    });

    test('recipient will have a validation error after entering an incorrect address length', () => {
      const badAddressLength =
        'penumbra1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd';

      useStore.getState().send.setRecipient(badAddressLength);
      expect(useStore.getState().send.validationErrors.recipient).toBeTruthy();
    });

    test('recipient will have a validation error after entering an address without penumbra as prefix', () => {
      const badAddressPrefix =
        'wwwwwwwwww1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6ppc4d';

      useStore.getState().send.setRecipient(badAddressPrefix);
      expect(useStore.getState().send.validationErrors.recipient).toBeTruthy();
    });
  });

  describe('setAsset', () => {
    test('asset can be set', () => {
      useStore.getState().send.setAsset(asset);
      expect(useStore.getState().send.asset.penumbraAssetId).toStrictEqual(asset);
    });
  });

  describe('setAssetBalance', () => {
    test('asset balance can be set', () => {
      useStore.getState().send.setAssetBalance(10);
      expect(useStore.getState().send.assetBalance).toBe(10);
    });
  });
});
