import { compute_position_id, get_lpnft_asset } from '../wasm/index.js';
import {
  Position,
  PositionId,
  PositionState,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

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
