import { IMessageTypeRegistry, createRegistry } from '@bufbuild/protobuf';

import * as ibcCore from './ibc-core';
import * as penumbra from './penumbra';
import * as penumbraCore from './penumbra-core';
import * as penumbraCnidarium from './penumbra-cnidarium';
import * as penumbraProxy from './penumbra-proxy';

import {
  ClientState,
  Header,
} from '@buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb';
import { MsgUpdateClient } from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/tx_pb';
import { MsgRecvPacket } from '@buf/cosmos_ibc.bufbuild_es/ibc/core/channel/v1/tx_pb';
import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';

/**
 * This type registry is for JSON serialization of protobuf messages.
 *
 * Some specced messages contain 'Any'-type fields, serialized with type
 * annotation URLs resolved with this registry.
 *
 * This registry currently contains types for all services used in communication
 * with a Penumbra extension, and should be able to resolve any message type
 * encountered.
 */

export const typeRegistry: IMessageTypeRegistry = createRegistry(
  ...Object.values(ibcCore),
  ...Object.values(penumbra),
  ...Object.values(penumbraCore),
  ...Object.values(penumbraCnidarium),
  ...Object.values(penumbraProxy),

  // Types not explicitly referenced by any above services should be added here.
  // Otherwise, it will not be possible to serialize/deserialize these types if,
  // e.g., they're used in an `Any` protobuf.

  // @buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb
  ClientState,
  Header,

  // @buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/tx_pb
  MsgUpdateClient,

  // @buf/cosmos_ibc.bufbuild_es/ibc/core/channel/v1/tx_pb
  MsgRecvPacket,

  // @buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb
  DutchAuction,
);

console.log('typeRegistry', typeRegistry);

/**
 * Appropriate for any ConnectRPC `Transport` object or protobuf `Any`
 * pack/unpack that handles protojson expected to contain these registry types.
 * @see https://docs.cosmos.network/v0.50/build/architecture/adr-027-deterministic-protobuf-serialization
 */
export const jsonOptions = {
  typeRegistry,

  // read options
  ignoreUnknownFields: true,

  // write options
  emitDefaultValues: false,
};
