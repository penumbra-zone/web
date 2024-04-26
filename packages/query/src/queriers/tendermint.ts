import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1/tendermint_proxy_connect';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1/txhash_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import type { TendermintQuerierInterface } from '@penumbra-zone/types/querier';

export class TendermintQuerier implements TendermintQuerierInterface {
  private readonly client: PromiseClient<typeof TendermintProxyService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, TendermintProxyService);
  }

  async latestBlockHeight() {
    const res = await this.client.getStatus({});
    return res.syncInfo!.latestBlockHeight;
  }

  async broadcastTx(tx: Transaction) {
    const params = tx.toBinary();
    // Note that "synchronous" here means "wait for the tx to be accepted by
    // the fullnode", not "wait for the tx to be included on chain.
    const { hash, log, code } = await this.client.broadcastTxSync({ params });

    if (code !== 0n) {
      throw new Error(`Tendermint error ${code.toString()}: ${log}`);
    }

    return new TransactionId({ inner: hash });
  }

  async getTransaction(txId: TransactionId): Promise<{ height: bigint; transaction: Transaction }> {
    const res = await this.client.getTx({ hash: txId.inner });
    const transaction = Transaction.fromBinary(res.tx);
    return { height: res.height, transaction };
  }
}
