import { asReceiverTransactionView } from '@penumbra-zone/perspective/translators/transaction-view';
import { viewClient } from '../../clients';
import { TransactionView, TransactionInfo } from '@penumbra-zone/protobuf/types';

const fetchReceiverView = async (txInfo: TransactionInfo): Promise<TransactionView> => {
  return await asReceiverTransactionView(txInfo.view, {
    isControlledAddress: async address =>
      viewClient.indexByAddress({ address }).then(({ addressIndex }) => Boolean(addressIndex)),
  });
};

export default fetchReceiverView;
