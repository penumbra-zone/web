import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1alpha1/app_pb';
import { Transaction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/app/v1alpha1/app_connect';
import { AppQuerierInterface } from '@penumbra-zone/types/src/querier';

export class AppQuerier implements AppQuerierInterface {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  async appParams(): Promise<AppParameters> {
    const { appParameters } = await this.client.appParameters({});
    if (!appParameters) throw new Error('no app parameters in response');
    return appParameters;
  }

  async txsByHeight(blockHeight: bigint): Promise<Transaction[]> {
    const { blockHeight: responseHeight, transactions } = await this.client.transactionsByHeight({
      blockHeight,
    });
    if (responseHeight !== blockHeight)
      throw new Error(
        `block height mismatch: requested ${blockHeight}, received ${responseHeight}`,
      );
    return transactions;
  }
}
