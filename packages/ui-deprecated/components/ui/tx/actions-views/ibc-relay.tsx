import { ViewBox } from '../viewbox';
import { create, fromJsonString, isMessage } from '@bufbuild/protobuf';
import { ActionDetails } from './action-details';
import {
  FungibleTokenPacketDataSchema,
  IbcRelay,
} from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';

import {
  MsgAcknowledgementSchema,
  MsgRecvPacketSchema,
  MsgTimeoutSchema,
  MsgTimeoutOnCloseSchema,
  MsgRecvPacket,
  MsgTimeout,
  MsgAcknowledgement,
  MsgTimeoutOnClose,
} from '@penumbra-zone/protobuf/ibc/core/channel/v1/tx_pb';

import {
  MsgUpdateClient,
  MsgUpdateClientSchema,
} from '@penumbra-zone/protobuf/ibc/core/client/v1/tx_pb';
import { UnimplementedView } from './unimplemented-view.tsx';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { ReactElement } from 'react';
import { Packet } from '@penumbra-zone/protobuf/ibc/core/channel/v1/channel_pb';
import { getUtcTime } from './isc20-withdrawal.tsx';
import { CircleX } from 'lucide-react';
import { anyUnpackTo } from '@bufbuild/protobuf/wkt';

// Attempt to parse data w/ fallbacks if unknown or failures
const ParsedPacketData = ({
  data,
  dataParser,
}: {
  data: Uint8Array;
  dataParser?: (arg: Uint8Array) => ReactElement;
}) => {
  if (!data.length) {
    return undefined;
  }

  if (!dataParser) {
    return <ActionDetails.Row label='Data'>Unknown packet data</ActionDetails.Row>;
  }

  try {
    return dataParser(data);
  } catch (e) {
    return <ActionDetails.Row label='Data'>Error while parsing data</ActionDetails.Row>;
  }
};

const PacketRows = ({
  packet,
  dataParser,
}: {
  packet: Packet;
  dataParser?: (arg: Uint8Array) => ReactElement;
}) => {
  return (
    <>
      <ParsedPacketData data={packet.data} dataParser={dataParser} />
      <ActionDetails.Row label='Sequence'>{Number(packet.sequence)}</ActionDetails.Row>
      <ActionDetails.Row label='Source Port'>{packet.sourcePort}</ActionDetails.Row>
      <ActionDetails.Row label='Source Channel'>{packet.sourceChannel}</ActionDetails.Row>
      <ActionDetails.Row label='Destination Port'>{packet.destinationPort}</ActionDetails.Row>
      <ActionDetails.Row label='Destination Channel'>{packet.destinationChannel}</ActionDetails.Row>
      {!!packet.timeoutHeight?.revisionHeight && (
        <ActionDetails.Row label='Timeout revision height'>
          {Number(packet.timeoutHeight.revisionHeight)}
        </ActionDetails.Row>
      )}
      {!!packet.timeoutHeight?.revisionNumber && (
        <ActionDetails.Row label='Timeout revision number'>
          {Number(packet.timeoutHeight.revisionNumber)}
        </ActionDetails.Row>
      )}
      <ActionDetails.Row label='Timeout timestamp'>
        {getUtcTime(packet.timeoutTimestamp)}
      </ActionDetails.Row>
    </>
  );
};

// Packet data stored as json string encoded into bytes
const parseFungibleTokenData = (packetData: Uint8Array) => {
  const dataString = new TextDecoder().decode(packetData);
  const parsed = fromJsonString(FungibleTokenPacketDataSchema, dataString);
  return (
    <>
      <ActionDetails.Row label='Sender'>
        <ActionDetails.TruncatedText>{parsed.sender}</ActionDetails.TruncatedText>
      </ActionDetails.Row>
      <ActionDetails.Row label='Receiver'>
        <ActionDetails.TruncatedText>{parsed.receiver}</ActionDetails.TruncatedText>
      </ActionDetails.Row>
      <ActionDetails.Row label='Denom'>{parsed.denom}</ActionDetails.Row>
      <ActionDetails.Row label='Amount'>{parsed.amount}</ActionDetails.Row>
      <ActionDetails.Row label='Memo'>{parsed.memo}</ActionDetails.Row>
    </>
  );
};

const MsgResvComponent = ({ packet }: { packet: MsgRecvPacket }) => {
  return (
    <ViewBox
      label='IBC Relay: Msg Received'
      visibleContent={
        <ActionDetails>
          {!!packet.packet && (
            <PacketRows packet={packet.packet} dataParser={parseFungibleTokenData} />
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

const MsgTimeoutComponent = ({ timeout }: { timeout: MsgTimeout | MsgTimeoutOnClose }) => {
  return (
    <ViewBox
      label='IBC Relay: Msg Timeout'
      visibleContent={
        <ActionDetails>
          {!!timeout.packet && (
            <PacketRows packet={timeout.packet} dataParser={parseFungibleTokenData} />
          )}
          {!!timeout.proofHeight?.revisionHeight && (
            <ActionDetails.Row label='Proof revision height'>
              {Number(timeout.proofHeight.revisionHeight)}
            </ActionDetails.Row>
          )}
          {!!timeout.proofHeight?.revisionNumber && (
            <ActionDetails.Row label='Proof revision number'>
              {Number(timeout.proofHeight.revisionNumber)}
            </ActionDetails.Row>
          )}
          <ActionDetails.Row label='Next Sequence Received'>
            {Number(timeout.nextSequenceRecv)}
          </ActionDetails.Row>
          <ActionDetails.Row label='Signer'>{timeout.signer}</ActionDetails.Row>
          <ActionDetails.Row label='Proof unreceived'>
            <ActionDetails.TruncatedText>
              {uint8ArrayToBase64(timeout.proofUnreceived)}
            </ActionDetails.TruncatedText>
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};

const MsgAckComponent = ({ ack }: { ack: MsgAcknowledgement }) => {
  return (
    <ViewBox
      label='IBC Relay: Msg Acknowledgement'
      visibleContent={
        <ActionDetails>
          {!!ack.packet && <PacketRows packet={ack.packet} dataParser={parseFungibleTokenData} />}
          {!!ack.proofHeight?.revisionHeight && (
            <ActionDetails.Row label='Proof revision height'>
              {Number(ack.proofHeight.revisionHeight)}
            </ActionDetails.Row>
          )}
          {!!ack.proofHeight?.revisionNumber && (
            <ActionDetails.Row label='Proof revision number'>
              {Number(ack.proofHeight.revisionNumber)}
            </ActionDetails.Row>
          )}
          <ActionDetails.Row label='Signer'>{ack.signer}</ActionDetails.Row>
          <ActionDetails.Row label='Ackknowledgement'>
            <ActionDetails.TruncatedText>
              {uint8ArrayToBase64(ack.acknowledgement)}
            </ActionDetails.TruncatedText>
          </ActionDetails.Row>
          <ActionDetails.Row label='Proof Acked'>
            <ActionDetails.TruncatedText>
              {uint8ArrayToBase64(ack.proofAcked)}
            </ActionDetails.TruncatedText>
          </ActionDetails.Row>
        </ActionDetails>
      }
    />
  );
};

export const IbcRelayComponent = ({ value }: { value: IbcRelay }) => {
  try {
    if (isMessage(value.rawAction, MsgRecvPacketSchema)) {
      const packet = create(MsgRecvPacketSchema);
      anyUnpackTo(value.rawAction, MsgRecvPacketSchema, packet);
      return <MsgResvComponent packet={packet} />;
    }

    if (isMessage(value.rawAction, MsgUpdateClientSchema)) {
      const update = create(MsgUpdateClientSchema);
      anyUnpackTo(value.rawAction, MsgUpdateClientSchema, update);
      return <UpdateClientComponent update={update} />;
    }

    if (isMessage(value.rawAction, MsgTimeoutSchema)) {
      const timeout = create(MsgTimeoutSchema);
      anyUnpackTo(value.rawAction, MsgTimeoutSchema, timeout);
      return <MsgTimeoutComponent timeout={timeout} />;
    }

    if (isMessage(value.rawAction, MsgTimeoutOnCloseSchema)) {
      const timeout = create(MsgTimeoutOnCloseSchema);
      anyUnpackTo(value.rawAction, MsgTimeoutOnCloseSchema, timeout);
      return <MsgTimeoutComponent timeout={timeout} />;
    }

    if (isMessage(value.rawAction, MsgAcknowledgementSchema)) {
      const ack = create(MsgAcknowledgementSchema);
      anyUnpackTo(value.rawAction, MsgAcknowledgementSchema, ack);
      return <MsgAckComponent ack={ack} />;
    }
  } catch (e) {
    return (
      <ViewBox
        label='IBC Relay'
        visibleContent={
          <div className='flex gap-2 text-sm text-red-400'>
            <CircleX className='w-4' />
            <span className='mt-1'>Error while parsing details</span>
          </div>
        }
      />
    );
  }

  return <UnimplementedView label='IBC Relay' />;
};
