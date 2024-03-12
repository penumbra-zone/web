import { UndelegateClaim } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { ViewBox } from './viewbox';
import { IdentityKeyComponent } from '../../identity-key-component';
import {
  getStartEpochIndexFromUndelegateClaim,
  getValidatorIdentityFromUndelegateClaim,
} from '@penumbra-zone/getters';
import { ActionDetails } from './action-details';

/** Render an `UndelegateClaim` action. */
export const UndelegateClaimComponent = ({ value }: { value: UndelegateClaim }) => {
  const validatorIdentity = getValidatorIdentityFromUndelegateClaim(value);
  const startEpochIndex = getStartEpochIndexFromUndelegateClaim(value);

  return (
    <ViewBox
      label='Undelegate Claim'
      visibleContent={
        <ActionDetails>
          <ActionDetails.Row label='Validator'>
            <IdentityKeyComponent identityKey={validatorIdentity} />
          </ActionDetails.Row>

          <ActionDetails.Row label='Unbonding start epoch'>
            {startEpochIndex.toString()}
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};
