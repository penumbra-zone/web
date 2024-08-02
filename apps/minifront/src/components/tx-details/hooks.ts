import { asReceiverTransactionView } from '@penumbra-zone/perspective/translators/transaction-view';
import { viewClient } from '../../clients';
import { TransactionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

const fetchReceiverView = async (txInfo: TransactionInfo): Promise<TransactionView> => {
  return await asReceiverTransactionView(txInfo.view, {
    isControlledAddress: async address =>
      viewClient.indexByAddress({ address }).then(({ addressIndex }) => Boolean(addressIndex)),
  });
};

export default fetchReceiverView;
