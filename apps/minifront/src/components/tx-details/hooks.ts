import { useEffect, useState } from 'react';
import { asReceiverTransactionView } from '@penumbra-zone/perspective/translators/transaction-view';
import { viewClient } from '../../clients';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

interface UseReceiverViewResult {
  receiverView: TransactionView | null;
}

const useReceiverView = (
  txInfo: TransactionInfo | undefined,
  option: string,
): UseReceiverViewResult => {
  const [receiverView, setReceiverView] = useState<TransactionView | null>(null);

  useEffect(() => {
    const fetchReceiverView = async (): Promise<void> => {
      if (txInfo) {
        try {
          const asReceiver = await asReceiverTransactionView(txInfo.view, {
            isControlledAddress: address =>
              viewClient
                .indexByAddress({ address })
                .then(({ addressIndex }) => Boolean(addressIndex)),
          });
          setReceiverView(asReceiver);
        } catch (error) {
          console.error('Failed to fetch receiver view:', error);
        }
      }
    };

    if (option === 'reciever') {
      fetchReceiverView();
    }
  }, [option, txInfo]);

  return { receiverView };
};

export default useReceiverView;
