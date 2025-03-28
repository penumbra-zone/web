import { PositionState_PositionStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { PositionsTable } from '@/entities/position';

export const PortfolioClosedPositions = () => {
  return (
    <PositionsTable
      stateFilter={[
        PositionState_PositionStateEnum.CLOSED,
        PositionState_PositionStateEnum.WITHDRAWN,
      ]}
    />
  );
};
