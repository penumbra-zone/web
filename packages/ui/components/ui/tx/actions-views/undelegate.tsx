import { Undelegate } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import { ViewBox } from '../viewbox';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
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
          {!!value.fromEpoch && (
            <ActionDetails.Row label='Epoch index'>
              {value.fromEpoch.index.toString()}
            </ActionDetails.Row>
          )}

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
            <ActionDetails.Row label='Validator identity'>
              <ActionDetails.TruncatedText>
                {bech32mIdentityKey(value.validatorIdentity)}
              </ActionDetails.TruncatedText>
            </ActionDetails.Row>
          )}
        </ActionDetails>
      }
    />
  );
};
