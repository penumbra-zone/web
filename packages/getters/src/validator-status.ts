import { ValidatorStatus } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { createGetter } from './utils/create-getter.js';

export const getVotingPower = createGetter(
  (validatorStatus?: ValidatorStatus) => validatorStatus?.votingPower,
);

export const getState = createGetter((validatorStatus?: ValidatorStatus) => validatorStatus?.state);

export const getBondingState = createGetter(
  (validatorStatus?: ValidatorStatus) => validatorStatus?.bondingState,
);
