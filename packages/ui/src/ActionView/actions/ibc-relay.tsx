import { useMemo } from 'react';
import {
  MsgAcknowledgement,
  MsgRecvPacket,
  MsgTimeout,
  MsgTimeoutOnClose,
} from '@penumbra-zone/protobuf/ibc/core/channel/v1/tx_pb';
import { MsgUpdateClient } from '@penumbra-zone/protobuf/ibc/core/client/v1/tx_pb';
import { IbcRelay } from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import {
  Denom,
  ValueView,
  Metadata,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { unpackIbcRelay } from '@penumbra-zone/perspective/action-view/ibc';
import { fromString } from '@penumbra-zone/types/amount';
import { useDensity } from '../../utils/density';
import { ActionWrapper } from '../shared/wrapper';
import { ActionViewBaseProps } from '../types';
import { ActionRow } from '../shared/action-row';
import { Density } from '../../Density';
import { AddressViewComponent } from '../../AddressView';
import { ValueViewComponent } from '../../ValueView';

export interface IbcRelayActionProps extends ActionViewBaseProps {
  value: IbcRelay;
}

export const IbcRelayAction = ({ value, getMetadata }: IbcRelayActionProps) => {
  const density = useDensity();

  const data = useMemo(() => {
    return unpackIbcRelay(value);
  }, [value]);

  const sender = useMemo(() => {
    if (!data?.tokenData?.sender) {
      return undefined;
    }

    return new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address: {
            altBech32m: data.tokenData.sender,
          },
        },
      },
    });
  }, [data]);

  const receiver = useMemo(() => {
    if (!data?.tokenData?.receiver) {
      return undefined;
    }

    return new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address: {
            altBech32m: data.tokenData.receiver,
          },
        },
      },
    });
  }, [data]);

  const message = useMemo(() => {
    if (!data?.message) {
      return undefined;
    }

    const messageMap: Record<string, string> = {
      [MsgRecvPacket.typeName]: 'ICS-20 Transfer',
      [MsgUpdateClient.typeName]: 'Update Client',
      [MsgTimeout.typeName]: 'Timeout',
      [MsgTimeoutOnClose.typeName]: 'Timeout',
      [MsgAcknowledgement.typeName]: 'Acknowledgement',
    };

    return messageMap[data.message.getType().typeName];
  }, [data]);

  const valueView = useMemo(() => {
    if (!data?.tokenData || !data.packet) {
      return undefined;
    }

    // sometimes denom comes in form of "uosmo", and sometimes as "transfer/channel-4/uosmo",
    // where "transfer" is `sourcePort` and "channel-4" is `sourceChannel`.
    // the next lines extract the denom part from and merges it with destination data.
    // Penumbra is the only asset that doesn't have "transfer" in the denom – hardcode it here.
    const denomMatch = /\/([^/]+)$/.exec(data.tokenData.denom);
    let assetDenom = `${data.packet.destinationPort}/${data.packet.destinationChannel}/${denomMatch?.[1] ?? data.tokenData.denom}`;
    if (data.tokenData.denom === 'upenumbra' || denomMatch?.[1] === 'upenumbra') {
      assetDenom = 'penumbra';
    }

    // TODO: `getMetadata` should query by `Metadata.base` instead of `Metadata.display` in this case
    const asset = getMetadata?.(new Denom({ denom: assetDenom }));
    const amount = fromString(data.tokenData.amount);

    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount,
          metadata:
            asset ??
            new Metadata({
              display: assetDenom,
              symbol: data.tokenData.denom,
              denomUnits: [
                {
                  denom: assetDenom,
                  exponent: 0,
                },
              ],
            }),
        },
      },
    });
  }, [data, getMetadata]);

  return (
    <ActionWrapper
      title='IBC Relay'
      opaque={false}
      infoRows={[
        message && <ActionRow key='message' label='Message' info={message} />,
        sender && (
          <ActionRow
            key='sender'
            label='Sender'
            info={
              <Density slim>
                <AddressViewComponent addressView={sender} truncate copyable external />
              </Density>
            }
          />
        ),
      ]}
    >
      <Density slim>
        {valueView && (
          <ValueViewComponent
            priority={density === 'sparse' ? 'primary' : 'tertiary'}
            valueView={valueView}
            signed='positive'
          />
        )}
        {receiver && <AddressViewComponent addressView={receiver} truncate copyable external />}
      </Density>
    </ActionWrapper>
  );
};
