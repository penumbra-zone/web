import type { ServiceImpl } from '@connectrpc/connect';
import type { StakeService } from '@penumbra-zone/protobuf';
import { getValidatorInfo } from './get-validator-info';
import { validatorInfo } from './validator-info';
import { validatorPenalty } from './validator-penalty';
import { currentValidatorRate } from './current-validator-rate';

export type Impl = ServiceImpl<typeof StakeService>;

export const stakeImpl: Omit<Impl, 'validatorStatus' | 'validatorUptime'> = {
  currentValidatorRate,
  getValidatorInfo,
  validatorInfo,
  validatorPenalty,
};
