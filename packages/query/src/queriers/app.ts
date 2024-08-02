import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils.js';
import { AppParameters } from '@penumbra-zone/protobuf/penumbra/core/app/v1/app_pb';
import { Transaction } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { AppService } from '@penumbra-zone/protobuf';
import type { AppQuerierInterface } from '@penumbra-zone/types/querier';

export class AppQuerier implements AppQuerierInterface {
  private readonly client: PromiseClient<typeof AppService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, AppService);
  }

  async appParams(): Promise<AppParameters> {
    const { appParameters } = await this.client.appParameters({});
    if (!appParameters) {
      throw new Error('no app parameters in response');
    }
    return appParameters;
  }

  async txsByHeight(blockHeight: bigint): Promise<Transaction[]> {
    const { blockHeight: responseHeight, transactions } = await this.client.transactionsByHeight({
      blockHeight,
    });
    if (responseHeight !== blockHeight) {
      throw new Error(
        `block height mismatch: requested ${blockHeight}, received ${responseHeight}`,
      );
    }
    return transactions;
  }
}
