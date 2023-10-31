import { beforeEach, describe, expect, test } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from '.';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { sendValidationErrors } from './send';

describe('Send Slice', () => {
  const assetExample = {
    inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
    altBaseDenom: '',
    altBech32: '',
  };

  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore());
  });

  test('the default is empty, false or undefined', () => {
    const { amount, memo, recipient, hidden, asset, txInProgress } = useStore.getState().send;
    expect(amount).toBe('');
    expect(memo).toBe('');
    expect(recipient).toBe('');
    expect(hidden).toBeFalsy();
    expect(asset).toBeTruthy();
    expect(txInProgress).toBeFalsy();

    const { amountErr, recipientErr } = sendValidationErrors(
      asset,
      amount,
      recipient,
      new Amount(),
    );
    expect(amountErr).toBeFalsy();
    expect(recipientErr).toBeFalsy();
  });

  describe('setAmount', () => {
    test('amount can be set', () => {
      useStore.getState().send.setAmount('2');
      expect(useStore.getState().send.amount).toBe('2');
    });

    test('validate high enough amount validates', () => {
      useStore.getState().send.setAsset(assetExample);
      useStore.getState().send.setAmount('1');
      const { asset, amount } = useStore.getState().send;

      const assetBalance = new Amount({ hi: 1n });
      const { amountErr } = sendValidationErrors(asset, amount, 'xyz', assetBalance);
      expect(amountErr).toBeFalsy();
    });

    test('validate error when too low the balance of the asset', () => {
      useStore.getState().send.setAsset(assetExample);
      useStore.getState().send.setAmount('6');
      const { asset, amount } = useStore.getState().send;
      const { amountErr } = sendValidationErrors(asset, amount, 'xyz', new Amount({ lo: 2n }));
      expect(amountErr).toBeTruthy();
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
      const { asset, amount, recipient } = useStore.getState().send;
      const { recipientErr } = sendValidationErrors(asset, amount, recipient, new Amount());
      expect(recipientErr).toBeFalsy();
    });

    test('recipient will have a validation error after entering an incorrect address length', () => {
      const badAddressLength =
        'penumbra1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd';

      useStore.getState().send.setRecipient(badAddressLength);
      const { asset, amount, recipient } = useStore.getState().send;
      const { recipientErr } = sendValidationErrors(asset, amount, recipient, new Amount());
      expect(recipientErr).toBeTruthy();
    });

    test('recipient will have a validation error after entering an address without penumbra as prefix', () => {
      const badAddressPrefix =
        'wwwwwwwwww1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6ppc4d';

      useStore.getState().send.setRecipient(badAddressPrefix);
      const { asset, amount, recipient } = useStore.getState().send;
      const { recipientErr } = sendValidationErrors(asset, amount, recipient, new Amount());
      expect(recipientErr).toBeTruthy();
    });
  });

  describe('setAsset', () => {
    test('asset can be set', () => {
      useStore.getState().send.setAsset(assetExample);
      expect(useStore.getState().send.asset.penumbraAssetId).toStrictEqual(assetExample);
    });
  });
});
