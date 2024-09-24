import { ViewBox } from '../viewbox';
import { ActionDetails } from './action-details';
import {
  FungibleTokenPacketData,
  IbcRelay,
} from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';
import { MsgRecvPacket } from '@penumbra-zone/protobuf/ibc/core/channel/v1/tx_pb';
import { MsgUpdateClient } from '@penumbra-zone/protobuf/ibc/core/client/v1/tx_pb';
import { UnimplementedView } from './unimplemented-view.tsx';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { getUtcTime } from './isc20-withdrawal.tsx';
import { useMemo } from 'react';

// Packet data stored as json string encoded into bytes
const parsePacket = ({ packet }: MsgRecvPacket): FungibleTokenPacketData | undefined => {
  if (!packet?.data) {
    return undefined;
  }

  try {
    const dataString = new TextDecoder().decode(packet.data);
    return FungibleTokenPacketData.fromJsonString(dataString);
  } catch (e) {
    return undefined;
  }
};

const MsgResvComponent = ({ packet }: { packet: MsgRecvPacket }) => {
  const packetData = useMemo(() => parsePacket(packet), [packet]);

  return (
    <ViewBox
      label='IBC Relay: Msg Received'
      visibleContent={
        <ActionDetails>
          {packetData === undefined && (
            <ActionDetails.Row label='Data'>Unknown packet data</ActionDetails.Row>
          )}
          {!!packetData?.sender && (
            <ActionDetails.Row label='Sender'>
              <ActionDetails.TruncatedText>{packetData.sender}</ActionDetails.TruncatedText>
            </ActionDetails.Row>
          )}
          {!!packetData?.receiver && (
            <ActionDetails.Row label='Receiver'>
              <ActionDetails.TruncatedText>{packetData.receiver}</ActionDetails.TruncatedText>
            </ActionDetails.Row>
          )}
          {!!packetData?.denom && (
            <ActionDetails.Row label='Denom'>{packetData.denom}</ActionDetails.Row>
          )}
          {!!packetData?.amount && (
            <ActionDetails.Row label='Amount'>{packetData.amount}</ActionDetails.Row>
          )}
          {packetData && 'memo' in packetData && (
            <ActionDetails.Row label='Memo'>{packetData.memo}</ActionDetails.Row>
          )}
          {!!packet.packet?.sequence && (
            <ActionDetails.Row label='Sequence'>{Number(packet.packet.sequence)}</ActionDetails.Row>
          )}
          {!!packet.packet?.sourcePort && (
            <ActionDetails.Row label='Source Port'>{packet.packet.sourcePort}</ActionDetails.Row>
          )}
          {!!packet.packet?.sourceChannel && (
            <ActionDetails.Row label='Source Channel'>
              {packet.packet.sourceChannel}
            </ActionDetails.Row>
          )}
          {!!packet.packet?.destinationPort && (
            <ActionDetails.Row label='Destination Port'>
              {packet.packet.destinationPort}
            </ActionDetails.Row>
          )}
          {!!packet.packet?.destinationChannel && (
            <ActionDetails.Row label='Destination Channel'>
              {packet.packet.destinationChannel}
            </ActionDetails.Row>
          )}
          {!!packet.packet?.timeoutHeight?.revisionHeight && (
            <ActionDetails.Row label='Timeout revision height'>
              {Number(packet.packet.timeoutHeight.revisionHeight)}
            </ActionDetails.Row>
          )}
          {!!packet.packet?.timeoutHeight?.revisionNumber && (
            <ActionDetails.Row label='Timeout revision number'>
              {Number(packet.packet.timeoutHeight.revisionNumber)}
            </ActionDetails.Row>
          )}
          {!!packet.packet?.timeoutTimestamp && (
            <ActionDetails.Row label='Timeout timestamp'>
              {getUtcTime(packet.packet.timeoutTimestamp)}
            </ActionDetails.Row>
          )}
          <ActionDetails.Row label='Signer'>{packet.signer}</ActionDetails.Row>
          {!!packet.proofHeight?.revisionHeight && (
            <ActionDetails.Row label='Proof revision height'>
              {Number(packet.proofHeight.revisionHeight)}
            </ActionDetails.Row>
          )}
          {!!packet.proofHeight?.revisionNumber && (
            <ActionDetails.Row label='Proof revision number'>
              {Number(packet.proofHeight.revisionNumber)}
            </ActionDetails.Row>
          )}
          <ActionDetails.Row label='Proof commitment'>
            <ActionDetails.TruncatedText>
              {uint8ArrayToBase64(packet.proofCommitment)}
            </ActionDetails.TruncatedText>
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};

const UpdateClientComponent = ({ update }: { update: MsgUpdateClient }) => {
  return (
    <ViewBox
      label='IBC Relay: Update Client'
      visibleContent={
        <ActionDetails>
          <ActionDetails.Row label='Client id'>{update.clientId}</ActionDetails.Row>
          <ActionDetails.Row label='Signer'>{update.signer}</ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};

export const IbcRelayComponent = ({ value }: { value: IbcRelay }) => {
  if (value.rawAction?.is(MsgRecvPacket.typeName)) {
    const packet = new MsgRecvPacket();
    value.rawAction.unpackTo(packet);
    return <MsgResvComponent packet={packet} />;
  }

  if (value.rawAction?.is(MsgUpdateClient.typeName)) {
    const update = new MsgUpdateClient();
    value.rawAction.unpackTo(update);
    return <UpdateClientComponent update={update} />;
  }

  return <UnimplementedView label='IBC Relay' />;
};
