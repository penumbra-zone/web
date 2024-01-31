import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from './index.ts';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1alpha1/num_pb';
import { sendValidationErrors } from './send.ts';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Fee } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';
import { viewClient } from '../clients/grpc.ts';
import {
  AddressByIndexResponse,
  TransactionPlannerResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

vi.mock('../fetchers/address', () => ({
  getAddressByIndex: vi.fn(),
}));

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
    const { amount, memo, recipient, selection, txInProgress } = useStore.getState().send;

    expect(amount).toBe('');
    expect(selection).toBeUndefined();
    expect(memo).toBe('');
    expect(recipient).toBe('');

    expect(txInProgress).toBeFalsy();

    const { amountErr, recipientErr } = sendValidationErrors(
      selectionExample.asset,
      amount,
      recipient,
      memo,
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

      const { amountErr } = sendValidationErrors(selection?.asset, amount, 'xyz', 'a memo');
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
      const { amountErr } = sendValidationErrors(selection?.asset, amount, 'xyz', 'a memo');
      expect(amountErr).toBeTruthy();
    });
  });

  describe('setMemo', () => {
    test('memo can be set', () => {
      useStore.getState().send.setMemo('memo-test');
      expect(useStore.getState().send.memo).toBe('memo-test');
    });
  });

  describe('setRecipient and validate', () => {
    const rightAddress =
      'penumbra1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6ppc4';

    test('recipient can be set and validate', () => {
      useStore.getState().send.setSelection(selectionExample);
      useStore.getState().send.setRecipient(rightAddress);
      expect(useStore.getState().send.recipient).toBe(rightAddress);
      const { selection, amount, recipient, memo } = useStore.getState().send;
      const { recipientErr } = sendValidationErrors(selection?.asset, amount, recipient, memo);
      expect(recipientErr).toBeFalsy();
    });

    test('recipient will have a validation error after entering an incorrect address length', () => {
      const badAddressLength =
        'penumbra1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd';

      useStore.getState().send.setSelection(selectionExample);
      useStore.getState().send.setRecipient(badAddressLength);
      const { selection, amount, recipient, memo } = useStore.getState().send;
      const { recipientErr } = sendValidationErrors(selection?.asset, amount, recipient, memo);
      expect(recipientErr).toBeTruthy();
    });

    test('recipient will have a validation error after entering an address without penumbra as prefix', () => {
      const badAddressPrefix =
        'wwwwwwwwww1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6ppc4d';

      useStore.getState().send.setSelection(selectionExample);
      useStore.getState().send.setRecipient(badAddressPrefix);
      const { selection, amount, recipient, memo } = useStore.getState().send;
      const { recipientErr } = sendValidationErrors(selection?.asset, amount, recipient, memo);
      expect(recipientErr).toBeTruthy();
    });

    test('recipient will have a validation error after entering a very long memo', () => {
      useStore.getState().send.setMemo('b'.repeat(512));
      const { selection, amount, recipient, memo } = useStore.getState().send;
      const { memoErr } = sendValidationErrors(selection?.asset, amount, recipient, memo);
      expect(memoErr).toBeTruthy();
    });
  });

  describe('setSelection', () => {
    test('asset and account can be set', () => {
      useStore.getState().send.setSelection(selectionExample);
      expect(useStore.getState().send.selection).toStrictEqual(selectionExample);
    });
  });

  describe('refreshFee', () => {
    const amount = '1';
    const recipient =
      'penumbra1lsqlh43cxh6amvtu0g84v9s8sq0zef4mz8jvje9lxwarancqg9qjf6nthhnjzlwngplepq7vaam8h4z530gys7x2s82zn0sgvxneea442q63sumem7r096p7rd2tywm2v6ppc4';
    const memo = 'hello';
    const mockFee = new Fee({ amount: { hi: 1n, lo: 2n } });

    beforeEach(() => {
      vi.spyOn(viewClient, 'addressByIndex').mockResolvedValue(new AddressByIndexResponse());

      vi.spyOn(viewClient, 'transactionPlanner').mockResolvedValue(
        new TransactionPlannerResponse({ plan: { transactionParameters: { fee: mockFee } } }),
      );
    });

    afterEach(() => {
      vi.spyOn(viewClient, 'transactionPlanner').mockReset();
    });

    describe('when `fee` is not yet present in the state`', () => {
      test('sets `fee` to the one found in the transaction planner response', async () => {
        const prev = useStore.getState();
        useStore.setState({
          ...prev,
          send: {
            ...prev.send,
            amount,
            recipient,
            selection: selectionExample,
            memo,
            fee: undefined,
          },
        });

        await useStore.getState().send.refreshFee();

        expect(useStore.getState().send.fee).toBe(mockFee);
      });

      test('sets `fee` to the one found in the transaction planner response even if `memo` is falsey', async () => {
        const prev = useStore.getState();
        useStore.setState({
          ...prev,
          send: {
            ...prev.send,
            amount,
            recipient,
            selection: selectionExample,
            memo: '',
            fee: undefined,
          },
        });

        await useStore.getState().send.refreshFee();

        expect(useStore.getState().send.fee).toBe(mockFee);
      });

      test('sets `fee` to `undefined` if `amount` is falsey', async () => {
        const prev = useStore.getState();
        useStore.setState({
          ...prev,
          send: {
            ...prev.send,
            amount: '',
            recipient,
            selection: selectionExample,
            memo,
            fee: undefined,
          },
        });

        await useStore.getState().send.refreshFee();

        expect(useStore.getState().send.fee).toBeUndefined();
      });

      test('sets `fee` to `undefined` if `recipient` is falsey', async () => {
        const prev = useStore.getState();
        useStore.setState({
          ...prev,
          send: {
            ...prev.send,
            amount,
            recipient: '',
            selection: selectionExample,
            memo,
            fee: undefined,
          },
        });

        await useStore.getState().send.refreshFee();

        expect(useStore.getState().send.fee).toBeUndefined();
      });

      test('sets `fee` to `undefined` if `selection` is falsey', async () => {
        const prev = useStore.getState();
        useStore.setState({
          ...prev,
          send: {
            ...prev.send,
            amount,
            recipient,
            selection: undefined,
            memo,
            fee: undefined,
          },
        });

        await useStore.getState().send.refreshFee();

        expect(useStore.getState().send.fee).toBeUndefined();
      });
    });

    describe('when `fee` is already present in the state`', () => {
      test('sets `fee` to the one found in the transaction planner response', async () => {
        const prev = useStore.getState();
        useStore.setState({
          ...prev,
          send: {
            ...prev.send,
            amount,
            recipient,
            selection: selectionExample,
            memo,
            fee: new Fee({ amount: { hi: 0n, lo: 0n } }),
          },
        });

        await useStore.getState().send.refreshFee();

        expect(useStore.getState().send.fee).toBe(mockFee);
      });

      test('sets `fee` to the one found in the transaction planner response even if `memo` is falsey', async () => {
        const prev = useStore.getState();
        useStore.setState({
          ...prev,
          send: {
            ...prev.send,
            amount,
            recipient,
            selection: selectionExample,
            memo: '',
            fee: new Fee({ amount: { hi: 0n, lo: 0n } }),
          },
        });

        await useStore.getState().send.refreshFee();

        expect(useStore.getState().send.fee).toBe(mockFee);
      });

      test('sets `fee` to `undefined` if `amount` is falsey', async () => {
        const prev = useStore.getState();
        useStore.setState({
          ...prev,
          send: {
            ...prev.send,
            amount: '',
            recipient,
            selection: selectionExample,
            memo,
            fee: new Fee({ amount: { hi: 0n, lo: 0n } }),
          },
        });

        await useStore.getState().send.refreshFee();

        expect(useStore.getState().send.fee).toBeUndefined();
      });

      test('sets `fee` to `undefined` if `recipient` is falsey', async () => {
        const prev = useStore.getState();
        useStore.setState({
          ...prev,
          send: {
            ...prev.send,
            amount,
            recipient: '',
            selection: selectionExample,
            memo,
            fee: new Fee({ amount: { hi: 0n, lo: 0n } }),
          },
        });

        await useStore.getState().send.refreshFee();

        expect(useStore.getState().send.fee).toBeUndefined();
      });

      test('sets `fee` to `undefined` if `selection` is falsey', async () => {
        const prev = useStore.getState();
        useStore.setState({
          ...prev,
          send: {
            ...prev.send,
            amount,
            recipient,
            selection: undefined,
            memo,
            fee: new Fee({ amount: { hi: 0n, lo: 0n } }),
          },
        });

        await useStore.getState().send.refreshFee();

        expect(useStore.getState().send.fee).toBeUndefined();
      });
    });
  });
});
