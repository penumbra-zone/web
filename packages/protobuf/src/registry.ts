import { createRegistry, DescFile, DescMessage, DescService } from '@bufbuild/protobuf';

import * as ibcCore from './services/cosmos-ibc-core.js';
import * as penumbraCnidarium from './services/penumbra-cnidarium.js';
import * as penumbraCore from './services/penumbra-core.js';
import * as penumbraCustody from './services/penumbra-custody.js';
import * as penumbraUtil from './services/penumbra-util.js';
import * as penumbraView from './services/penumbra-view.js';
import {
  ClientStateSchema,
  HeaderSchema,
} from '../gen/ibc/lightclients/tendermint/v1/tendermint_pb.js';

type MessageOrService = DescMessage | DescService;

const collectSchemasFromFile = (file: DescFile, checked: Set<string>): MessageOrService[] => {
  if (checked.has(file.name)) {
    return [];
  }

  const schemas: MessageOrService[] = [...file.messages];
  for (const dependent of file.dependencies) {
    if (!file.name.startsWith('google/')) {
      schemas.push(...collectSchemasFromFile(dependent, checked));
    }
  }

  checked.add(file.name);
  return schemas;
};

export const collectSchemasFromService = (service: DescService): MessageOrService[] => {
  const schemas: MessageOrService[] = [service];
  const parsed = new Set<string>();

  schemas.push(...collectSchemasFromFile(service.file, parsed));
  return schemas;
};

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

const allMessages = [
  ...Object.values(ibcCore),
  ...Object.values(penumbraCnidarium),
  ...Object.values(penumbraCore),
  ...Object.values(penumbraCustody),
  ...Object.values(penumbraUtil),
  ...Object.values(penumbraView),
].flatMap(collectSchemasFromService);

export const typeRegistry = createRegistry(...allMessages, ClientStateSchema, HeaderSchema);

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
