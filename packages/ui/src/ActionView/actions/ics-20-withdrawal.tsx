import { useMemo } from 'react';
import { Ics20Withdrawal } from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { AddressViewComponent } from '../../AddressView';
import { ValueViewComponent } from '../../ValueView';
import { useDensity } from '../../utils/density';
import { ActionViewBaseProps } from '../types';
import { Density } from '../../Density';
import { ActionWrapper } from '../shared/wrapper';
import { ActionRow } from '../shared/action-row';

export interface Ics20WithdrawalActionProps extends ActionViewBaseProps {
  value: Ics20Withdrawal;
}

export const Ics20WithdrawalAction = ({ value, getMetadata }: Ics20WithdrawalActionProps) => {
  const density = useDensity();

  const valueView = useMemo(() => {
    if (!value.amount) {
      return undefined;
    }

    const asset = value.denom && getMetadata?.(value.denom);
    if (asset) {
      return new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            metadata: asset,
            amount: value.amount,
          },
        },
      });
    }

    return new ValueView({
      valueView: {
        case: 'unknownAssetId',
        value: {
          amount: value.amount,
        },
      },
    });
  }, [value, getMetadata]);

  const addressView = useMemo(() => {
    if (!value.returnAddress) {
      return undefined;
    }

    return new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address: value.returnAddress,
        },
      },
    });
  }, [value]);

  const receiverView = useMemo(() => {
    if (!value.destinationChainAddress) {
      return undefined;
    }

    return new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address: {
            altBech32m: value.destinationChainAddress,
          },
        },
      },
    });
  }, [value]);

  return (
    <ActionWrapper
      title='ICS 20 Withdrawal'
      opaque={false}
      infoRows={[
        receiverView && (
          <Density slim>
            <ActionRow
              label='Receiver'
              info={<AddressViewComponent addressView={receiverView} external copyable truncate />}
            />
          </Density>
        ),
      ]}
    >
      <Density slim>
        {valueView && (
          <ValueViewComponent
            priority={density === 'sparse' ? 'primary' : 'tertiary'}
            valueView={valueView}
            signed='negative'
          />
        )}
        {addressView && (
          <AddressViewComponent addressView={addressView} hideIcon copyable truncate />
        )}
      </Density>
    </ActionWrapper>
  );
};
