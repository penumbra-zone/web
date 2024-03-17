import { Undelegate } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { ViewBox } from './viewbox';
import { joinLoHiAmount } from '@penumbra-zone/types/src/amount';
import { bech32IdentityKey } from '@penumbra-zone/types/src/identity-key';
import { ActionDetails } from './action-details';

/**
 * Render an `Undelegate` action.
 */
export const UndelegateComponent = ({ value }: { value: Undelegate }) => {
  return (
    <ViewBox
      label='Undelegate'
      visibleContent={
        <ActionDetails>
          <ActionDetails.Row label='Epoch index'>
            {value.startEpochIndex.toString()}
          </ActionDetails.Row>

          {!!value.delegationAmount && (
            <ActionDetails.Row label='Delegation amount'>
              {joinLoHiAmount(value.delegationAmount).toString()}
            </ActionDetails.Row>
          )}

          {!!value.unbondedAmount && (
            <ActionDetails.Row label='Unbonded amount'>
              {joinLoHiAmount(value.unbondedAmount).toString()}
            </ActionDetails.Row>
          )}

          {/** @todo: Render validator name/etc. after fetching? */}
          {!!value.validatorIdentity && (
            <ActionDetails.Row label='Validator identity' truncate>
              {bech32IdentityKey(value.validatorIdentity)}
            </ActionDetails.Row>
          )}
        </ActionDetails>
      }
    />
  );
};
