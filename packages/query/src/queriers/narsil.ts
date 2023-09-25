import { PromiseClient } from '@connectrpc/connect';
import { InfoRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/narsil/ledger/v1alpha1/ledger_pb';
import { createClient } from './utils';
import { LedgerService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/narsil/ledger/v1alpha1/ledger_connect';

export class NarsilQuerier {
  private readonly client: PromiseClient<typeof LedgerService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, LedgerService);
  }

  async info() {
    const req = new InfoRequest();
    return this.client.info(req);
  }
}
