import { createRegistry } from '@bufbuild/protobuf';
import { ClientState } from '@buf/cosmos_ibc.bufbuild_es/ibc/lightclients/tendermint/v1/tendermint_pb';

// Add protobuf types we use that have `google.protobuf.Any` fields
// Needed to be able to serialize to json
// Used in transport package & clients who need to deserialize
export const typeRegistry = createRegistry(ClientState);
