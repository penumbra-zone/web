import { compute_position_id, get_lpnft_asset } from '../wasm';
import {
  Position,
  PositionId,
  PositionState,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

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
