import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import {
  GetBlockByHeightRequest,
  GetBlockByHeightResponse,
  GetStatusRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/util/tendermint_proxy/v1alpha1/tendermint_proxy_pb';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1alpha1/tendermint_proxy_connect';

export class TendermintQuerier {
  private readonly client: PromiseClient<typeof TendermintProxyService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, TendermintProxyService);
  }

  async lastBlockHeight() {
    const req = new GetStatusRequest();
    const res = await this.client.getStatus(req);
    return res.syncInfo!.latestBlockHeight;
  }

  async getBlock(height: bigint): Promise<GetBlockByHeightResponse> {
    const req = new GetBlockByHeightRequest({ height });
    return this.client.getBlockByHeight(req);
  }
}
