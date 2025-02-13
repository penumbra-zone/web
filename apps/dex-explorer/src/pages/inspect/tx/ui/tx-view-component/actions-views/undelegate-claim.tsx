import { UndelegateClaim } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { ViewBox } from '../viewbox';
import { IdentityKeyComponent } from './identity-key-component';
import { ActionDetails } from './action-details';
import {
  getUnbondingStartHeightFromUndelegateClaim,
  getValidatorIdentityFromUndelegateClaim,
} from '@penumbra-zone/getters/undelegate-claim';

/** Render an `UndelegateClaim` action. */
export const UndelegateClaimComponent = ({ value }: { value: UndelegateClaim }) => {
  const validatorIdentity = getValidatorIdentityFromUndelegateClaim(value);
  const unbondingStartHeight = getUnbondingStartHeightFromUndelegateClaim(value);

  return (
    <ViewBox
      label='Undelegate Claim'
      visibleContent={
        <ActionDetails>
          <ActionDetails.Row label='Validator'>
            <IdentityKeyComponent identityKey={validatorIdentity} />
          </ActionDetails.Row>

          <ActionDetails.Row label='Unbonding start height'>
            {unbondingStartHeight.toString()}
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};
