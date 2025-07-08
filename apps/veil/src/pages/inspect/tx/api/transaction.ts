import { useQuery } from '@tanstack/react-query';
import { createClient } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { useGrpcTransport } from '@/shared/api/transport';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { hexToUint8Array } from '@penumbra-zone/types/hex';

export const useTransactionInfo = (txHash: string, connected: boolean) => {
  const { data: grpc } = useGrpcTransport();
  return useQuery({
    queryKey: ['transaction', txHash, connected],
    retry: 1,
    queryFn: async () => {
      if (!grpc) {
        throw new Error("Impossible: useTransactionInfo's query is broken");
      }
      const hash = hexToUint8Array(txHash);

      if (connected) {
        const client = createClient(ViewService, grpc.transport);
        const viewServiceRes = await client.transactionInfoByHash({
          id: new TransactionId({
            inner: hash,
          }),
        });
        return viewServiceRes.txInfo;
      }

      // For non-connected users, we just need the transaction ID
      // The actual transaction details will be viewed on the explorer
      return new TransactionInfo({
        id: new TransactionId({ inner: hash }),
      });
    },
    enabled: !!txHash && !!grpc,
  });
};
