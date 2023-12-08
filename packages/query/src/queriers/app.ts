import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import {
  AppParametersRequest,
  TransactionsByHeightRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1alpha1/app_pb';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/app/v1alpha1/app_connect';
import { AppQuerierInterface } from '@penumbra-zone/types/src/querier';

export class AppQuerier implements AppQuerierInterface {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  async appParams() {
    const req = new AppParametersRequest();
    const res = await this.client.appParameters(req);
    return res.appParameters!;
  }

  async chainParams() {
    const appParams = await this.appParams();
    return appParams.chainParams!;
  }

  async txsByHeight(height: bigint) {
    const req = new TransactionsByHeightRequest({ blockHeight: height });
    return await this.client.transactionsByHeight(req);
  }
}
