import { asReceiverTransactionView } from '@penumbra-zone/perspective/translators/transaction-view';
import { ViewService } from '@penumbra-zone/protobuf';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb.js';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { praxClient } from '../../prax';

const fetchReceiverView = async (txInfo: TransactionInfo): Promise<TransactionView> => {
  return await asReceiverTransactionView(txInfo.view, {
    isControlledAddress: async address =>
      praxClient
        .service(ViewService)
        .indexByAddress({ address })
        .then(({ addressIndex }) => Boolean(addressIndex)),
  });
};

export default fetchReceiverView;
