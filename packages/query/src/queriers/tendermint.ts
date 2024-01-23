import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1alpha1/tendermint_proxy_connect';
import { TendermintQuerierInterface } from '@penumbra-zone/types';
import { TransactionId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/txhash/v1alpha1/txhash_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

// Should add more errors as we discover them
const tendermintErrors = ['proof did not verify', 'is not a valid field element'];

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
    const { hash, log } = await this.client.broadcastTxSync({ params });

    if (log) {
      if (tendermintErrors.some(e => log.includes(e))) {
        throw new Error(`Tendermint: ${log}`);
      } else {
        console.warn(log);
      }
    }
    return new TransactionId({ inner: hash });
  }

  async getTransaction(txId: TransactionId): Promise<{ height: bigint; transaction: Transaction }> {
    const res = await this.client.getTx({ hash: txId.inner });
    // TODO: check res.code? other failure states?
    if (res.txResult?.log.length) throw new Error(`Tendermint: ${res.txResult.log}`);
    const transaction = Transaction.fromBinary(res.tx);
    return { height: res.height, transaction };
  }
}
