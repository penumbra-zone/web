import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { describe, expect, test } from 'vitest';
import { viewTransactionPlan } from '.';
import {
  MemoView_Visible,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { bech32ToAddress } from '@penumbra-zone/bech32/src/address';

describe('viewTransactionPlan()', () => {
  const returnAddressAsBech32 =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const returnAddress = new Address({ inner: bech32ToAddress(returnAddressAsBech32) });
  const chainId = 'testnet';
  const expiryHeight = 100n;
  const mockFvk =
    'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09';

  const validTxnPlan = new TransactionPlan({
    memo: {
      plaintext: {
        returnAddress,
        text: 'Memo text here',
      },
    },
    transactionParameters: {
      fee: { amount: { hi: 1n, lo: 0n } },
      chainId,
      expiryHeight,
    },
  });

  test('includes the return address if it exists', () => {
    const txnView = viewTransactionPlan(validTxnPlan, {}, mockFvk);
    const memoViewValue = txnView.bodyView!.memoView!.memoView.value! as MemoView_Visible;

    expect(
      memoViewValue.plaintext!.returnAddress?.addressView.value?.address!.equals(returnAddress),
    ).toBe(true);
  });

  test('leaves out the return address when it does not exist', () => {
    const txnPlan = new TransactionPlan({
      transactionParameters: {
        fee: {
          amount: {
            hi: 1n,
            lo: 0n,
          },
        },
      },
    });
    const txnView = viewTransactionPlan(txnPlan, {}, mockFvk);
    const memoViewValue = txnView.bodyView!.memoView!.memoView.value! as MemoView_Visible;

    expect(memoViewValue.plaintext?.returnAddress).toBeUndefined();
  });

  test('includes the fee', () => {
    expect(
      viewTransactionPlan(validTxnPlan, {}, mockFvk).bodyView!.transactionParameters!.fee,
    ).toBe(validTxnPlan.transactionParameters!.fee);
  });

  test('throws when there is no fee', () => {
    expect(() =>
      viewTransactionPlan(
        new TransactionPlan({
          memo: {
            plaintext: {
              returnAddress,
            },
          },
          transactionParameters: {
            //fee,
            chainId,
            expiryHeight,
          },
        }),
        {},
        mockFvk,
      ),
    ).toThrow('No fee found in transaction plan');
  });

  test('includes the memo', () => {
    const txnView = viewTransactionPlan(validTxnPlan, {}, mockFvk);
    const memoViewValue = txnView.bodyView!.memoView!.memoView.value! as MemoView_Visible;

    expect(memoViewValue.plaintext!.text).toBe('Memo text here');
  });

  test('includes the transaction parameters', () => {
    expect(viewTransactionPlan(validTxnPlan, {}, mockFvk).bodyView!.transactionParameters).toEqual({
      fee: validTxnPlan.transactionParameters!.fee,
      chainId,
      expiryHeight,
    });
  });
});
