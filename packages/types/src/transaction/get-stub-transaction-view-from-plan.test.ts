import { describe, expect, test } from 'vitest';
import { getStubTransactionViewFromPlan } from './get-stub-transaction-view-from-plan';
import {
  MemoView_Visible,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

describe('getStubTransactionViewFromPlan()', () => {
  const returnAddress =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const chainId = 'testnet';
  const expiryHeight = 100n;

  const validTxnPlan = new TransactionPlan({
    fee: { amount: { hi: 1n, lo: 0n } },
    memoPlan: {
      plaintext: {
        returnAddress: {
          altBech32m: returnAddress,
        },
        text: 'Memo text here',
      },
    },
    chainId,
    expiryHeight,
  });

  test('includes the return address', () => {
    const txnView = getStubTransactionViewFromPlan(validTxnPlan, new Map());
    const memoViewValue = txnView.bodyView!.memoView!.memoView.value! as MemoView_Visible;

    expect(memoViewValue.plaintext!.returnAddress?.addressView.value?.address?.altBech32m).toBe(
      returnAddress,
    );
  });

  test('throws when there is no return address', () => {
    expect(() => getStubTransactionViewFromPlan(new TransactionPlan(), new Map())).toThrow(
      'No return address found in transaction plan',
    );
  });

  test('includes the fee', () => {
    expect(getStubTransactionViewFromPlan(validTxnPlan, new Map()).bodyView!.fee).toBe(
      validTxnPlan.fee,
    );
  });

  test('throws when there is no fee', () => {
    expect(() =>
      getStubTransactionViewFromPlan(
        new TransactionPlan({
          memoPlan: {
            plaintext: {
              returnAddress: {},
            },
          },
        }),
        new Map(),
      ),
    ).toThrow('No fee found in transaction plan');
  });

  test('includes the memo', () => {
    const txnView = getStubTransactionViewFromPlan(validTxnPlan, new Map());
    const memoViewValue = txnView.bodyView!.memoView!.memoView.value! as MemoView_Visible;

    expect(memoViewValue.plaintext!.text).toBe('Memo text here');
  });

  test('includes the transaction parameters', () => {
    expect(
      getStubTransactionViewFromPlan(validTxnPlan, new Map()).bodyView!.transactionParameters,
    ).toEqual({
      chainId,
      expiryHeight,
    });
  });
});
