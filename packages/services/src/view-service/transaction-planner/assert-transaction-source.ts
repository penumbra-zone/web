import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { Code, ConnectError } from '@connectrpc/connect';

export const assertTransactionSource = (transactionPlannerRequest: TransactionPlannerRequest) => {
  // Ensure that a source is provided in the transaction request.
  if (!transactionPlannerRequest.source) {
    throw new ConnectError(
      'Source is required in the TransactionPlannerRequest',
      Code.InvalidArgument,
    );
  }
};
