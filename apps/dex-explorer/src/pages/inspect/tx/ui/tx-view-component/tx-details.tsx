import { asReceiverTransactionView } from '@penumbra-zone/perspective/translators/transaction-view';
import { ViewService } from '@penumbra-zone/protobuf';
import { TransactionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { penumbra } from '@/shared/const/penumbra';

const fetchReceiverView = async (txInfo: TransactionInfo): Promise<TransactionView> => {
  return await asReceiverTransactionView(txInfo.view, {
    isControlledAddress: async address =>
      penumbra
        .service(ViewService)
        .indexByAddress({ address })
        .then(({ addressIndex }) => Boolean(addressIndex)),
  });
};

export default fetchReceiverView;
