import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { bech32ToUint8Array } from '@penumbra-zone/types';
import { describe, expect, test, vi } from 'vitest';
import { viewTransactionPlan } from '.';
import {
  MemoView_Visible,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

// Replace the wasm-pack import with the nodejs version so tests can run
vi.mock('@penumbra-zone/wasm-bundler', () => vi.importActual('@penumbra-zone/wasm-nodejs'));

describe('viewTransactionPlan()', () => {
  const returnAddressAsBech32 =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const returnAddress = new Address({ inner: bech32ToUint8Array(returnAddressAsBech32) });
  const chainId = 'testnet';
  const expiryHeight = 100n;
  const mockFvk =
    'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09';

  const validTxnPlan = new TransactionPlan({
    fee: { amount: { hi: 1n, lo: 0n } },
    memoPlan: {
      plaintext: {
        returnAddress,
        text: 'Memo text here',
      },
    },
    chainId,
    expiryHeight,
  });

  test('includes the return address', () => {
    const txnView = viewTransactionPlan(validTxnPlan, {}, mockFvk);
    const memoViewValue = txnView.bodyView!.memoView!.memoView.value! as MemoView_Visible;

    expect(
      memoViewValue.plaintext!.returnAddress?.addressView.value?.address!.equals(returnAddress),
    ).toBe(true);
  });

  test('throws when there is no return address', () => {
    expect(() => viewTransactionPlan(new TransactionPlan(), {}, mockFvk)).toThrow(
      'No return address found in transaction plan',
    );
  });

  test('includes the fee', () => {
    expect(viewTransactionPlan(validTxnPlan, {}, mockFvk).bodyView!.fee).toBe(validTxnPlan.fee);
  });

  test('throws when there is no fee', () => {
    expect(() =>
      viewTransactionPlan(
        new TransactionPlan({
          memoPlan: {
            plaintext: {
              returnAddress,
            },
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
      chainId,
      expiryHeight,
    });
  });
});
