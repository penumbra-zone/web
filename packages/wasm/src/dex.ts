import { compute_position_id, get_lpnft_asset } from '../wasm';
import {
  Position,
  PositionId,
  PositionState,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { JsonValue } from '@bufbuild/protobuf';

export const computePositionId = (position: Position): PositionId => {
  const result = compute_position_id(position.toJson()) as JsonValue;
  return PositionId.fromJson(result);
};

export const getLpNftMetadata = (
  positionId: PositionId,
  positionState: PositionState,
): Metadata => {
  const result = get_lpnft_asset(positionId.toJson(), positionState.toJson()) as JsonValue;
  return Metadata.fromJson(result);
};
