import { useQuery } from '@tanstack/react-query';
import { createClient } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { getGrpcTransport } from '@/shared/api/transport';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  ActionView,
  MemoView,
  MemoView_Opaque,
  Transaction,
  TransactionBodyView,
  TransactionPerspective,
  TransactionView,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';
import { hexToUint8Array } from '@penumbra-zone/types/hex';
import { TransactionApiResponse } from '@/shared/api/server/transaction/types';
import { asActionView } from './as-action-view';

export const useTransactionInfo = (txHash: string, connected: boolean) => {
  return useQuery({
    queryKey: ['transaction', txHash, connected],
    retry: 1,
    queryFn: async () => {
      const grpc = await getGrpcTransport();
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

      const res = await fetch(`/api/transactions/${txHash}`);
      const jsonRes = (await res.json()) as TransactionApiResponse;
      if ('error' in jsonRes) {
        throw new Error(jsonRes.error);
      }

      const { tx, height } = jsonRes;

      const transaction = Transaction.fromBinary(hexToUint8Array(tx));

      const txInfo = new TransactionInfo({
        height: BigInt(height),
        id: new TransactionId({ inner: hash }),
        transaction,
        perspective: new TransactionPerspective({
          transactionId: new TransactionId({ inner: hash }),
        }),
        view: new TransactionView({
          anchor: transaction.anchor,
          bindingSig: transaction.bindingSig,
          bodyView: new TransactionBodyView({
            actionViews: (transaction.body?.actions.map(asActionView).filter(Boolean) ??
              []) as ActionView[],
            transactionParameters: transaction.body?.transactionParameters,
            detectionData: transaction.body?.detectionData,
            memoView: new MemoView({
              memoView: {
                case: 'opaque',
                value: new MemoView_Opaque({}),
              },
            }),
          }),
        }),
      });
      return txInfo;
    },
    enabled: !!txHash,
  });
};
