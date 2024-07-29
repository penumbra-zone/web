import { compute_position_id, get_lpnft_asset } from '../wasm/index.js';
import { Position, PositionId, PositionState, Metadata } from '@penumbra-zone/protobuf/types';

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
