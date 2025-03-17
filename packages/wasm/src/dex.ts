import { compute_position_id, get_lpnft_asset } from '../wasm/index.js';
import { fromBinary, toBinary } from '@bufbuild/protobuf';
import {
  Position,
  PositionId,
  PositionIdSchema,
  PositionSchema,
  PositionState,
  PositionStateSchema,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { MetadataSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import type { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const computePositionId = (position: Position): PositionId => {
  const bytes = compute_position_id(toBinary(PositionSchema, position));
  return fromBinary(PositionIdSchema, bytes);
};

export const getLpNftMetadata = (
  positionId: PositionId,
  positionState: PositionState,
): Metadata => {
  const result = get_lpnft_asset(
    toBinary(PositionIdSchema, positionId),
    toBinary(PositionStateSchema, positionState),
  );
  return fromBinary(MetadataSchema, result);
};
