import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { createContextKey } from '@connectrpc/connect';
import { PartialMessage } from '@bufbuild/protobuf';

export type TxApprovalFn = (
  authorizeRequest: PartialMessage<AuthorizeRequest>,
  transactionView: PartialMessage<TransactionView>,
) => Promise<boolean>;

export const approverCtx = createContextKey<TxApprovalFn | undefined>(undefined);
