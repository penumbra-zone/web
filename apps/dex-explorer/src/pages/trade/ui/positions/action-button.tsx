import { observer } from 'mobx-react-lite';
import { Button } from '@penumbra-zone/ui/Button';
import {
  Position,
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { positionsStore } from '@/pages/trade/model/positions';
import { Dash } from './dash';

export const ActionButton = observer(({ id, position }: { id: PositionId; position: Position }) => {
  const { loading, closePositions, withdrawPositions } = positionsStore;
  const state = position.state;

  if (state?.state === PositionState_PositionStateEnum.OPENED) {
    return (
      <Button
        density='slim'
        onClick={() => void closePositions([{ position, id }])}
        disabled={loading}
      >
        Close
      </Button>
    );
  } else if (state?.state === PositionState_PositionStateEnum.CLOSED) {
    return (
      <Button
        density='slim'
        disabled={loading}
        onClick={() => void withdrawPositions([{ position, id }])}
      >
        Withdraw
      </Button>
    );
  } else {
    return <Dash />;
  }
});
