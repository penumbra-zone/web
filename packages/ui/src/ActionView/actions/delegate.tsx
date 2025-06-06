import { Delegate } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { ActionWrapper } from '../shared/wrapper';
import { ActionRow } from '../shared/action-row';
import { ValueView, Denom } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '../../ValueView';
import { Density } from '../../Density';
import { shorten } from '@penumbra-zone/types/string';
import { ArrowRight } from 'lucide-react';
import { ActionViewBaseProps } from '../types';

export interface DelegateActionProps extends ActionViewBaseProps {
  value: Delegate;
}

export const DelegateAction = ({ value, getMetadata }: DelegateActionProps) => {
  // Try to get UM metadata from the metadata service
  const umMetadata = getMetadata?.(new Denom({ denom: 'upenumbra' }));

  // Try to get delegation token metadata from the metadata service
  const delegationMetadata = (() => {
    if (value.validatorIdentity && getMetadata) {
      const validatorIdStr = bech32mIdentityKey(value.validatorIdentity);
      const delegationDenom = `udelegation_${validatorIdStr}`;
      return getMetadata(new Denom({ denom: delegationDenom }));
    }
    return undefined;
  })();

  // Input: unbondedAmount (UM being delegated)
  const inputAmountView = value.unbondedAmount
    ? new ValueView({
        valueView: umMetadata
          ? {
              case: 'knownAssetId',
              value: {
                amount: value.unbondedAmount,
                metadata: umMetadata,
              },
            }
          : {
              case: 'unknownAssetId',
              value: {
                amount: value.unbondedAmount,
                assetId: undefined,
              },
            },
      })
    : undefined;

  // Output: delegationAmount (delUM tokens received)
  const outputAmountView = value.delegationAmount
    ? new ValueView({
        valueView: delegationMetadata
          ? {
              case: 'knownAssetId',
              value: {
                amount: value.delegationAmount,
                metadata: delegationMetadata,
              },
            }
          : {
              case: 'unknownAssetId',
              value: {
                amount: value.delegationAmount,
                assetId: undefined,
              },
            },
      })
    : undefined;

  const validatorIdStr = value.validatorIdentity
    ? bech32mIdentityKey(value.validatorIdentity)
    : undefined;

  return (
    <ActionWrapper
      title='Delegate'
      opaque={false}
      infoRows={
        <>
          {validatorIdStr && (
            <ActionRow
              label='Validator identity'
              info={shorten(validatorIdStr, 12)}
              copyText={validatorIdStr}
            />
          )}
        </>
      }
    >
      <div className='flex flex-row items-center gap-1'>
        <Density slim>
          {inputAmountView && (
            <div className='flex flex-col gap-1'>
              <ValueViewComponent signed='negative' valueView={inputAmountView} />
            </div>
          )}
          <ArrowRight size={10} className='text-text-primary' />
          {outputAmountView && (
            <div className='flex flex-col gap-1'>
              <ValueViewComponent signed='positive' valueView={outputAmountView} />
            </div>
          )}
        </Density>
      </div>
    </ActionWrapper>
  );
};
