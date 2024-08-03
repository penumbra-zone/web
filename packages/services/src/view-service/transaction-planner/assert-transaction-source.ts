import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
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
