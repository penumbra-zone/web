import { compute_position_id, decrypt_position_metadata, get_lpnft_asset } from '../wasm/index.js';
import {
  Position,
  PositionId,
  PositionMetadata,
  PositionState,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { FullViewingKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const computePositionId = (position: Position): PositionId => {
  const bytes = compute_position_id(position.toBinary());
  return PositionId.fromBinary(bytes);
};

export const getLpNftMetadata = (
  positionId: PositionId,
  positionState: PositionState,
): Metadata => {
  const result = get_lpnft_asset(positionId.toBinary(), positionState.toBinary());
  return Metadata.fromBinary(result);
};

export const decryptPositionMetadata = (
  fullViewingKey: FullViewingKey,
  position_metadata: PositionMetadata,
): PositionMetadata => {
  const bytes = decrypt_position_metadata(fullViewingKey.toBinary(), position_metadata.toBinary());
  return PositionMetadata.fromBinary(bytes);
};
