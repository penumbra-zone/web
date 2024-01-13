import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { AllSlices, SliceCreator } from './index';
import { MessageResponder } from '@penumbra-zone/types/src/internal-msg/shared';
import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';
import { getStubTransactionViewFromPlan } from '@penumbra-zone/types/src/transaction/get-stub-transaction-view-from-plan';
import { JsonValue } from '@bufbuild/protobuf';

export interface TxApprovalSlice {
  // Is AuthorizeRequest-jsonified. Zustand+Immer does not allow for storing classes and Typescript does not allow for JsValue.
  authorizeRequest: object | undefined;
  // Is a map of penumbraAssetId to DenomMetadata-jsonified.
  denomMetadataByAssetId: Record<string, object> | undefined;
  // Holding the message responder function. Service worker will be "awaiting" the call of this.
  responder: MessageResponder<TxApproval> | undefined;
}

export const createTxApprovalSlice: SliceCreator<TxApprovalSlice> = () => ({
  authorizeRequest: undefined,
  denomMetadataByAssetId: undefined,
  responder: undefined,
});

export const txApprovalSelector = (state: AllSlices) => state.txApproval;

export const stubTransactionViewSelector = (state: AllSlices) => {
  const authorizeRequest = state.txApproval.authorizeRequest as JsonValue;
  if (!authorizeRequest) return undefined;

  return getStubTransactionViewFromPlan(
    TransactionPlan.fromJson(authorizeRequest.plan),
    state.txApproval.denomMetadataByAssetId as Record<string, JsonValue>,
  );
};
