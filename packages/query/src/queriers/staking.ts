import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils.js';
import { StakeService } from '@penumbra-zone/protobuf';
import {
  ValidatorInfoResponse,
  ValidatorPenaltyRequest,
  ValidatorPenaltyResponse,
} from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { StakeQuerierInterface } from '@penumbra-zone/types/querier';

export class StakeQuerier implements StakeQuerierInterface {
  private readonly client: PromiseClient<typeof StakeService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, StakeService);
  }

  allValidatorInfos(): AsyncIterable<ValidatorInfoResponse> {
    /**
     * Include inactive validators when saving to our local database, since we
     * serve the `ValidatorInfo` RPC method from the extension, and may receive
     * requests for inactive validators.
     */
    return this.client.validatorInfo({ showInactive: true });
  }

  validatorPenalty(req: ValidatorPenaltyRequest): Promise<ValidatorPenaltyResponse> {
    return this.client.validatorPenalty(req);
  }
}
