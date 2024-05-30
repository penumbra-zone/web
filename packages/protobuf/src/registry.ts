import { IMessageTypeRegistry, createRegistry } from '@bufbuild/protobuf';

import * as ibcCore from './ibc-core';
import * as penumbra from './penumbra';
import * as penumbraCore from './penumbra-core';
import * as penumbraProxy from './penumbra-proxy';

// Necessary types not explicitly referenced by any above services
import { ClientState } from '@buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb';

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
  ...Object.values(penumbraProxy),

  ClientState,
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
