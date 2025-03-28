import { PositionsTable } from '@/entities/position';
import { PositionState_PositionStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export const PortfolioOpenPositions = () => {
  return <PositionsTable stateFilter={[PositionState_PositionStateEnum.OPENED]} />;
};
