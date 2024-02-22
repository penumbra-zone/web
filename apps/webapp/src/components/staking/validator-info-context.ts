import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { createContext } from 'react';

export interface ValidatorInfoContext {
  validatorInfos: ValidatorInfo[];

  /**
   * Each validator's voting power, expressed as an integer percentage between
   * 0-100.
   */
  votingPowerByValidatorInfo: Map<ValidatorInfo, number>;

  loading: boolean;
  error: unknown;
}

export const ValidatorInfoContext = createContext<ValidatorInfoContext>({
  validatorInfos: [],
  votingPowerByValidatorInfo: new Map(),
  loading: false,
  error: undefined,
});
