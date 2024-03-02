import { Undelegate } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { ViewBox } from './viewbox';
import { bech32IdentityKey, joinLoHiAmount } from '@penumbra-zone/types';

/**
 * Render an `Undelegate` action.
 *
 * @todo: Make this nicer :)
 */
export const UndelegateComponent = ({ value }: { value: Undelegate }) => {
  return (
    <ViewBox
      label='Undelegate'
      visibleContent={
        <div className='flex flex-col gap-2'>
          <div>
            <span className='font-bold'>Epoch index:</span> {value.startEpochIndex.toString()}
          </div>

          {!!value.delegationAmount && (
            <div>
              <span className='font-bold'>Delegation amount:</span>{' '}
              {joinLoHiAmount(value.delegationAmount).toString()}
            </div>
          )}

          {!!value.unbondedAmount && (
            <div>
              <span className='font-bold'>Unbonded amount:</span>{' '}
              {joinLoHiAmount(value.unbondedAmount).toString()}
            </div>
          )}

          {/** @todo: Render validator name/etc. after fetching? */}
          {!!value.validatorIdentity && (
            <div>
              <span className='font-bold'>Validator identity:</span>{' '}
              {bech32IdentityKey(value.validatorIdentity)}
            </div>
          )}
        </div>
      }
    />
  );
};
