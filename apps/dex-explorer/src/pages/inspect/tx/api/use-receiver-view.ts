import { useQuery } from '@tanstack/react-query';
import { asReceiverTransactionView } from '@penumbra-zone/perspective/translators/transaction-view';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';

/**
 * Asynchronously fetches the receiver view of a transaction.
 */
export const useReceiverView = (enabled: boolean, txInfo?: TransactionInfo) => {
  const hash = txInfo?.id && uint8ArrayToHex(txInfo.id.inner);

  return useQuery({
    queryKey: ['receiverView', hash],
    enabled,
    queryFn: async () => {
      if (!txInfo?.view) {
        return undefined;
      }

      return asReceiverTransactionView(txInfo.view, {
        isControlledAddress: async address =>
          penumbra
            .service(ViewService)
            .indexByAddress({ address })
            .then(({ addressIndex }) => Boolean(addressIndex)),
      });
    },
  });
};
