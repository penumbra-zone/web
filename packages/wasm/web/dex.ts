import { compute_position_id } from '@penumbra-zone/wasm-bundler';
import {
  Position,
  PositionId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';

export const computePositionId = (position: Position): PositionId => {
  const result = compute_position_id(position.toJson()) as unknown;
  return PositionId.fromJsonString(JSON.stringify(result));
};
