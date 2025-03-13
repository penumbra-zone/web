import {
  FungibleTokenPacketDataSchema,
  IbcRelay,
  FungibleTokenPacketData,
} from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';
import { create, fromJsonString } from '@bufbuild/protobuf';
import { anyIs, anyUnpackTo } from '@bufbuild/protobuf/wkt';

import {
  MsgAcknowledgementSchema,
  MsgRecvPacketSchema,
  MsgTimeoutSchema,
  MsgTimeoutOnCloseSchema,
} from '@penumbra-zone/protobuf/ibc/core/channel/v1/tx_pb';

import type {
  MsgAcknowledgement,
  MsgRecvPacket,
  MsgTimeout,
  MsgTimeoutOnClose,
} from '@penumbra-zone/protobuf/ibc/core/channel/v1/tx_pb';
import { MsgUpdateClientSchema } from '@penumbra-zone/protobuf/ibc/core/client/v1/tx_pb';
import type { MsgUpdateClient } from '@penumbra-zone/protobuf/ibc/core/client/v1/tx_pb';
import { Packet } from '@penumbra-zone/protobuf/ibc/core/channel/v1/channel_pb';

export const parsePacketTokenData = (packet: Packet): FungibleTokenPacketData => {
  const dataString = new TextDecoder().decode(packet.data);
  return fromJsonString(FungibleTokenPacketDataSchema, dataString);
};

export interface IbcRelayData {
  message: MsgRecvPacket | MsgUpdateClient | MsgTimeout | MsgTimeoutOnClose | MsgAcknowledgement;
  packet?: Packet;
  tokenData?: FungibleTokenPacketData;
}

/**
 * IbcRelay action has a single field `rawAction` of type Any.
 * This function unpacks the rawAction field into a more structured object.
 * All Msg-* types except MsgUpdateClient have a Packet field that can also be unpacked
 * to `tokenData` with more information about the IBC deposit.
 */
export const unpackIbcRelay = (value: IbcRelay): IbcRelayData | undefined => {
  if (!value.rawAction) {
    return undefined;
  }

  if (anyIs(value.rawAction, MsgUpdateClientSchema)) {
    const message = create(MsgUpdateClientSchema);
    anyUnpackTo(value.rawAction, MsgUpdateClientSchema, message);
    return {
      message,
    };
  }

  let message: MsgRecvPacket | MsgTimeout | MsgTimeoutOnClose | MsgAcknowledgement;

  if (anyIs(value.rawAction, MsgRecvPacketSchema)) {
    message = create(MsgRecvPacketSchema);
    anyUnpackTo(value.rawAction, MsgRecvPacketSchema, message);
  } else if (anyIs(value.rawAction, MsgTimeoutSchema)) {
    message = create(MsgTimeoutSchema);
    anyUnpackTo(value.rawAction, MsgTimeoutSchema, message);
  } else if (anyIs(value.rawAction, MsgTimeoutOnCloseSchema)) {
    message = create(MsgTimeoutOnCloseSchema);
    anyUnpackTo(value.rawAction, MsgTimeoutOnCloseSchema, message);
  } else if (anyIs(value.rawAction, MsgAcknowledgementSchema)) {
    message = create(MsgAcknowledgementSchema);
    anyUnpackTo(value.rawAction, MsgAcknowledgementSchema, message);
  } else {
    return undefined;
  }

  return {
    message,
    packet: message.packet,
    tokenData: message.packet && parsePacketTokenData(message.packet),
  };
};
