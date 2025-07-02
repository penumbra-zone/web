import {
  Position,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { pnum } from '@penumbra-zone/types/pnum';

/** Check if a position is fully withdrawn.
 *
 * In other words, the position is withdrawn, with no reserves.
 */
export function fullyWithdrawn(position: Position): boolean {
  return (
    position.state?.state === PositionState_PositionStateEnum.WITHDRAWN &&
    pnum(position.reserves?.r1).toNumber() <= 0 &&
    pnum(position.reserves?.r2).toNumber() <= 0
  );
}
