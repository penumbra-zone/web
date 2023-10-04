import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import {
  GetBlockByHeightRequest,
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

  // TODO: create zod schema
  async getBlock(height: bigint) {
    const req = new GetBlockByHeightRequest({ height });
    return await this.client.getBlockByHeight(req);
  }
}
