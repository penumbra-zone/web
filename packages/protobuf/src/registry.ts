import { createRegistry, IMessageTypeRegistry } from '@bufbuild/protobuf';

import * as ibcCore from './services/cosmos-ibc-core.js';
import * as penumbraCnidarium from './services/penumbra-cnidarium.js';
import * as penumbraCore from './services/penumbra-core.js';
import * as penumbraCustody from './services/penumbra-custody.js';
import * as penumbraUtil from './services/penumbra-util.js';
import * as penumbraView from './services/penumbra-view.js';
import { ClientState, Header } from '../gen/ibc/lightclients/tendermint/v1/tendermint_pb.js';
import { DutchAuction } from '../gen/penumbra/core/component/auction/v1/auction_pb.js';

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
  ...Object.values(penumbraCnidarium),
  ...Object.values(penumbraCore),
  ...Object.values(penumbraCustody),
  ...Object.values(penumbraUtil),
  ...Object.values(penumbraView),

  // Types not explicitly referenced by any above services should be added here.
  // Otherwise, it will not be possible to serialize/deserialize these types if,
  // e.g., they're used in an `Any` protobuf.

  // gen/ibc/lightclients/tendermint/v1/tendermint_pb
  ClientState,
  Header,

  // penumbra/core/component/auction/v1/auction_pb
  DutchAuction,
);

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
