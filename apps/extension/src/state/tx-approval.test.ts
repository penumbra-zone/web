import { AllSlices, initializeStore } from '.';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { mockLocalExtStorage, mockSessionExtStorage } from '@penumbra-zone/storage';
import { transactionViewSelector } from './tx-approval';
import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { Jsonified } from '@penumbra-zone/types';
import { viewTransactionPlan } from '@penumbra-zone/types/src/transaction/view-transaction-plan';

// Replace the wasm-pack import with the nodejs version so tests can run
vi.mock('@penumbra-zone/wasm-bundler', () => vi.importActual('@penumbra-zone/wasm-nodejs'));

describe('TX Approval Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;

  beforeEach(() => {
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage(), mockLocalExtStorage()));
  });

  describe('transactionViewSelector', () => {
    test('returns the result of `viewTransactionPlan`', () => {
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

      useStore.setState({
        txApproval: {
          authorizeRequest: {
            preAuthorizations: [],
            plan: validTxnPlan.toJson() as Jsonified<TransactionPlan>,
          },
          denomMetadataByAssetId: {},
        },
      });

      const state = useStore.getState();
      const result = transactionViewSelector(state);
      const expected = viewTransactionPlan(validTxnPlan, {});

      expect(result!.equals(expected)).toBe(true);
    });

    describe('when `authorizeRequest` is undefined', () => {
      beforeEach(() => {
        useStore.setState({ txApproval: {} });
      });

      test('returns undefined', () => {
        const state = useStore.getState();
        const result = transactionViewSelector(state);

        expect(result).toBeUndefined();
      });
    });

    describe('when `authorizeRequest.plan` is undefined', () => {
      beforeEach(() => {
        useStore.setState({
          txApproval: {
            authorizeRequest: { preAuthorizations: [] },
          },
        });
      });

      test('returns undefined', () => {
        const state = useStore.getState();
        const result = transactionViewSelector(state);

        expect(result).toBeUndefined();
      });
    });

    describe('when `denomMetadataByAssetId` is undefined', () => {
      beforeEach(() => {
        useStore.setState({
          txApproval: {
            authorizeRequest: {
              preAuthorizations: [],
              plan: new TransactionPlan().toJson() as Jsonified<TransactionPlan>,
            },
          },
        });
      });

      test('returns undefined', () => {
        const state = useStore.getState();
        const result = transactionViewSelector(state);

        expect(result).toBeUndefined();
      });
    });
  });
});
