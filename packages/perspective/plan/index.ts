import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getAddressView } from './get-address-view';
import {
  TransactionPlan,
  TransactionView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { viewActionPlan } from './view-action-plan';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

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
export const viewTransactionPlan = async (
  txPlan: TransactionPlan,
  metadataByAssetId: (id: AssetId) => Promise<Metadata>,
  fullViewingKey: FullViewingKey,
): Promise<TransactionView> => {
  const returnAddress = txPlan.memo?.plaintext?.returnAddress;
  const transactionParameters = txPlan.transactionParameters;
  if (!transactionParameters?.fee) throw new Error('No fee found in transaction plan');

  return new TransactionView({
    bodyView: {
      actionViews: await Promise.all(
        txPlan.actions.map(viewActionPlan(metadataByAssetId, fullViewingKey)),
      ),
      memoView: {
        memoView: {
          case: 'visible',
          value: {
            plaintext: {
              returnAddress: returnAddress
                ? getAddressView(returnAddress, fullViewingKey)
                : undefined,
              text: txPlan.memo?.plaintext?.text ?? '',
            },
          },
        },
      },
      transactionParameters,
    },
  });
};
