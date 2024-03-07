import { PromiseClient } from '@connectrpc/connect';
import { createClient } from './utils';
import { StakingQuerierInterface } from '@penumbra-zone/types';
import { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import {
  ValidatorInfoResponse,
  ValidatorPenaltyRequest,
  ValidatorPenaltyResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';

export class StakingQuerier implements StakingQuerierInterface {
  private readonly client: PromiseClient<typeof StakingService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, StakingService);
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
