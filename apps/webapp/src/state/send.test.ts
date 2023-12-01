import { beforeEach, describe, expect, test } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index.ts';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { sendValidationErrors } from './send.ts';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

describe('Send Slice', () => {
  const selectionExample = {
    asset: {
      amount: new Amount({
        lo: 0n,
        hi: 0n,
      }),
      denom: { display: 'test_usd', exponent: 18 },
      usdcValue: 0,
      assetId: new AssetId().fromJson({ inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=' }),
    },
    address:
      'penumbra1e8k5c3ds484dxvapeamwveh5khqv4jsvyvaf5wwxaaccgfghm229qw03pcar3ryy8smptevstycch0qk3uurrgkvtjpny3cu3rjd0agawqtlz6erev28a6sg69u7cxy0t02nd1',
    accountIndex: 0,
  };

  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore()) as UseBoundStore<StoreApi<AllSlices>>;
  });

  test('the default is empty, false or undefined', () => {
    const { amount, memo, recipient, hidden, selection, txInProgress } = useStore.getState().send;

    expect(amount).toBe('');
    expect(selection).toBeUndefined();
    expect(memo).toBe('');
    expect(recipient).toBe('');
    expect(hidden).toBeFalsy();

    expect(txInProgress).toBeFalsy();

    const { amountErr, recipientErr } = sendValidationErrors(
      selectionExample.asset,
      amount,
      recipient,
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
      const assetBalance = new Amount({ hi: 1n });
      useStore.getState().send.setSelection({
        ...selectionExample,
        asset: { ...selectionExample.asset, amount: assetBalance },
      });
      useStore.getState().send.setAmount('1');
      const { selection, amount } = useStore.getState().send;

      const { amountErr } = sendValidationErrors(selection?.asset, amount, 'xyz');
      expect(amountErr).toBeFalsy();
    });

    test('validate error when too low the balance of the asset', () => {
      const assetBalance = new Amount({ lo: 2n });
      useStore.getState().send.setSelection({
        ...selectionExample,
        asset: { ...selectionExample.asset, amount: assetBalance },
      });
      useStore.getState().send.setAmount('6');
      const { selection, amount } = useStore.getState().send;
      const { amountErr } = sendValidationErrors(selection?.asset, amount, 'xyz');
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
      useStore.getState().send.setSelection(selectionExample);
      useStore.getState().send.setRecipient(rightAddress);
      expect(useStore.getState().send.recipient).toBe(rightAddress);
      const { selection, amount, recipient } = useStore.getState().send;
      const { recipientErr } = sendValidationErrors(selection?.asset, amount, recipient);
      expect(recipientErr).toBeFalsy();
    });

    test('recipient will have a validation error after entering an incorrect address length', () => {
      const badAddressLength =
        'penumbra1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd';

      useStore.getState().send.setSelection(selectionExample);
      useStore.getState().send.setRecipient(badAddressLength);
      const { selection, amount, recipient } = useStore.getState().send;
      const { recipientErr } = sendValidationErrors(selection?.asset, amount, recipient);
      expect(recipientErr).toBeTruthy();
    });

    test('recipient will have a validation error after entering an address without penumbra as prefix', () => {
      const badAddressPrefix =
        'wwwwwwwwww1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6ppc4d';

      useStore.getState().send.setSelection(selectionExample);
      useStore.getState().send.setRecipient(badAddressPrefix);
      const { selection, amount, recipient } = useStore.getState().send;
      const { recipientErr } = sendValidationErrors(selection?.asset, amount, recipient);
      expect(recipientErr).toBeTruthy();
    });
  });

  describe('setSelection', () => {
    test('asset and account can be set', () => {
      useStore.getState().send.setSelection(selectionExample);
      expect(useStore.getState().send.selection).toStrictEqual(selectionExample);
    });
  });
});
