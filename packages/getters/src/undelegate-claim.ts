import {
  UndelegateClaim,
  UndelegateClaimBody,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { createGetter } from './utils/create-getter';
import { getValidatorIdentity } from './undelegate-claim-body';

export const getBody = createGetter((undelegateClaim?: UndelegateClaim) => undelegateClaim?.body);

export const getValidatorIdentityFromUndelegateClaim = getBody.pipe(getValidatorIdentity);

export const getStartEpochIndexFromUndelegateClaim = getBody.pipe(
  // Defining this inline rather than exporting `getStartEpochIndex` from
  // `undelegate-claim-body.ts`, since `getStartEpochIndex` is already defined
  // elsewhere and thus would result in a naming conflict in the exports from
  // this package.
  createGetter((undelegateClaimBody?: UndelegateClaimBody) => undelegateClaimBody?.startEpochIndex),
);
