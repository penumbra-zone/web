import {
  GetValidatorInfoRequest,
  GetValidatorInfoResponse,
  ValidatorInfoRequest,
  ValidatorInfoResponse,
  ValidatorPenaltyRequest,
  ValidatorPenaltyResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import { PartialMessage } from '@bufbuild/protobuf';
import { PromiseClient } from '@connectrpc/connect';
import { StakeService } from '@penumbra-zone/protobuf';
import { StakeQuerierInterface } from '@penumbra-zone/types/querier';
import { createClient } from './utils.js';

export class StakeQuerier implements StakeQuerierInterface {
  private readonly client: PromiseClient<typeof StakeService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, StakeService);
  }

  getValidatorInfo(
    req: PartialMessage<GetValidatorInfoRequest>,
  ): Promise<GetValidatorInfoResponse> {
    return this.client.getValidatorInfo(req);
  }

  validatorInfo(req: PartialMessage<ValidatorInfoRequest>): AsyncIterable<ValidatorInfoResponse> {
    return this.client.validatorInfo(req);
  }

  validatorPenalty(
    req: PartialMessage<ValidatorPenaltyRequest>,
  ): Promise<ValidatorPenaltyResponse> {
    return this.client.validatorPenalty(req);
  }
}
