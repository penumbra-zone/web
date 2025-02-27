import {
  FungibleTokenPacketData,
  IbcRelay,
} from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';
import {
  MsgAcknowledgement,
  MsgRecvPacket,
  MsgTimeout,
  MsgTimeoutOnClose,
} from '@penumbra-zone/protobuf/ibc/core/channel/v1/tx_pb';
import { MsgUpdateClient } from '@penumbra-zone/protobuf/ibc/core/client/v1/tx_pb';
import { Packet } from '@penumbra-zone/protobuf/ibc/core/channel/v1/channel_pb';

export const parsePacketTokenData = (packet: Packet): FungibleTokenPacketData => {
  const dataString = new TextDecoder().decode(packet.data);
  return FungibleTokenPacketData.fromJsonString(dataString);
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

  if (value.rawAction.is(MsgUpdateClient.typeName)) {
    const message = new MsgUpdateClient();
    value.rawAction.unpackTo(message);
    return {
      message,
    };
  }

  let message: MsgRecvPacket | MsgTimeout | MsgTimeoutOnClose | MsgAcknowledgement;

  if (value.rawAction.is(MsgRecvPacket.typeName)) {
    message = new MsgRecvPacket();
  } else if (value.rawAction.is(MsgTimeout.typeName)) {
    message = new MsgTimeout();
  } else if (value.rawAction.is(MsgTimeoutOnClose.typeName)) {
    message = new MsgTimeoutOnClose();
  } else if (value.rawAction.is(MsgAcknowledgement.typeName)) {
    message = new MsgAcknowledgement();
  } else {
    return undefined;
  }

  value.rawAction.unpackTo(message);

  return {
    message,
    packet: message.packet,
    tokenData: message.packet && parsePacketTokenData(message.packet),
  };
};
