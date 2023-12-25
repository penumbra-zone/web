import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import {
  BroadcastTxAsyncRequest,
  GetStatusRequest,
  GetTxRequest,
  GetTxResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/util/tendermint_proxy/v1alpha1/tendermint_proxy_pb';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1alpha1/tendermint_proxy_connect';
import { TendermintQuerierInterface } from '@penumbra-zone/types';

export class TendermintQuerier implements TendermintQuerierInterface {
  private readonly client: PromiseClient<typeof TendermintProxyService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, TendermintProxyService);
  }

  async latestBlockHeight() {
    const req = new GetStatusRequest();
    const res = await this.client.getStatus(req);
    return res.syncInfo!.latestBlockHeight;
  }

  async broadcastTx(params: Uint8Array) {
    const req = new BroadcastTxAsyncRequest({ params });
    const res = await this.client.broadcastTxAsync(req);
    return res.hash;
  }

  async txByHash(hash: Uint8Array): Promise<GetTxResponse | undefined> {
    const req = new GetTxRequest({ hash });
    return await this.client.getTx(req);
  }
}
