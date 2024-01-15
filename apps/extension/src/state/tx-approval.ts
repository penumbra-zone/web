import { AllSlices, SliceCreator } from './index';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { Jsonified } from '@penumbra-zone/types';
import { MessageResponder } from '@penumbra-zone/types/src/internal-msg/shared';
import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';
import { viewTransactionPlan } from '@penumbra-zone/types/src/transaction/view-transaction-plan';

export interface TxApprovalSlice {
  authorizeRequest?: Jsonified<AuthorizeRequest>;
  denomMetadataByAssetId?: Record<string, Jsonified<DenomMetadata>>;
  // Holding the message responder function. Service worker will be "awaiting" the call of this.
  responder?: MessageResponder<TxApproval>;
}

export const createTxApprovalSlice: SliceCreator<TxApprovalSlice> = () => ({});

export const txApprovalSelector = (state: AllSlices) => state.txApproval;

export const stubTransactionViewSelector = (state: AllSlices) => {
  const authorizeRequest = state.txApproval.authorizeRequest;
  if (!authorizeRequest?.plan || !state.txApproval.denomMetadataByAssetId) return undefined;

  return viewTransactionPlan(
    TransactionPlan.fromJson(authorizeRequest.plan),
    state.txApproval.denomMetadataByAssetId,
  );
};
