import type { ServiceImpl } from '@connectrpc/connect';
import type { StakeService } from '@penumbra-zone/protobuf';
import { getValidatorInfo } from './get-validator-info.js';
import { validatorInfo } from './validator-info.js';
import { validatorPenalty } from './validator-penalty.js';
import { validatorStatus } from './validator-status.js';

export type Impl = ServiceImpl<typeof StakeService>;

export const stakeImpl: Omit<Impl, 'currentValidatorRate' | 'validatorUptime'> = {
  getValidatorInfo,
  validatorInfo,
  validatorPenalty,
  validatorStatus,
};
