import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getAddressView } from './get-address-view';
import { Jsonified } from '@penumbra-zone/types';
import {
  TransactionPlan,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { viewActionPlan } from './view-action-plan';

/**
 * Given a `TransactionPlan`, returns a `TransactionView` that can be passed to
 * a `<TransactionViewComponent />` so as to render the plan as though it's an
 * already-completed transaction.
 *
 * Note that, since it is of course _not_ actually a completed transaction, the
 * `TransactionView` is sort of a stub -- that is, it will be missing some
 * properties. Its main purpose is to be able to render the transaction plan,
 * not to be exhaustive.
 */
export const viewTransactionPlan = (
  txPlan: TransactionPlan,
  metadataByAssetId: Record<string, Jsonified<Metadata>>,
  fullViewingKey: string,
): TransactionView => {
  const returnAddress = txPlan.memo?.plaintext?.returnAddress;
  if (!returnAddress) throw new Error('No return address found in transaction plan');
  const transactionParameters = txPlan.transactionParameters;
  if (!transactionParameters?.fee) throw new Error('No fee found in transaction plan');

  return new TransactionView({
    bodyView: {
      actionViews: txPlan.actions.map(viewActionPlan(metadataByAssetId, fullViewingKey)),
      memoView: {
        memoView: {
          case: 'visible',
          value: {
            plaintext: {
              returnAddress: getAddressView(returnAddress, fullViewingKey),
              text: txPlan.memo?.plaintext?.text ?? '',
            },
          },
        },
      },
      transactionParameters,
    },
  });
};
