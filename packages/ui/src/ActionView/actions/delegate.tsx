import { Delegate } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { ActionWrapper } from '../shared/wrapper';
import { ActionRow } from '../shared/action-row';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';
import { ValueViewComponent } from '../../ValueView';
import { Density } from '../../Density';
import { shorten } from '@penumbra-zone/types/string';
import { ArrowRight } from 'lucide-react';

export interface DelegateActionProps {
  value: Delegate;
}

// UM metadata for displaying delegation amounts
const UM_METADATA = new Metadata({
  denomUnits: [
    {
      denom: 'penumbra',
      exponent: 6,
    },
    {
      denom: 'upenumbra',
      exponent: 0,
    },
  ],
  base: 'upenumbra',
  display: 'penumbra',
  symbol: 'UM',
  penumbraAssetId: {
    inner: base64ToUint8Array('KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='),
  },
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    },
  ],
});

export const DelegateAction = ({ value }: DelegateActionProps) => {
  const delegationAmountView = value.delegationAmount
    ? new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: value.delegationAmount,
            metadata: UM_METADATA,
          },
        },
      })
    : undefined;

  const unbondedAmountView = value.unbondedAmount
    ? new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: value.unbondedAmount,
            metadata: UM_METADATA,
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
      <div className='flex flex-row gap-1 items-center'>
        <Density slim>
          {delegationAmountView && (
            <div className='flex flex-col gap-1'>
              <ValueViewComponent valueView={delegationAmountView} />
            </div>
          )}
          <ArrowRight size={10} />
          {unbondedAmountView && (
            <div className='flex flex-col gap-1'>
              <ValueViewComponent valueView={unbondedAmountView} />
            </div>
          )}
        </Density>
      </div>
    </ActionWrapper>
  );
};
