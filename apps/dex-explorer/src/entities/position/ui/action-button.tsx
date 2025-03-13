import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@penumbra-zone/ui/Button';
import {
  Position,
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { withdrawPositions } from '../api/withdraw-positions';
import { closePositions } from '../api/close-positions';
import { Dash } from './dash';

export const ActionButton = observer(({ id, position }: { id: PositionId; position: Position }) => {
  const [isLoading, setIsLoading] = useState(false);

  const state = position.state;

  const withdraw = async () => {
    setIsLoading(true);
    await withdrawPositions([{ position, id }]);
    setIsLoading(false);
  };

  const close = async () => {
    setIsLoading(true);
    await closePositions([{ position, id }]);
    setIsLoading(false);
  };

  if (state?.state === PositionState_PositionStateEnum.OPENED) {
    return (
      <Button onClick={() => void close()} disabled={isLoading}>
        Close
      </Button>
    );
  } else if (state?.state === PositionState_PositionStateEnum.CLOSED) {
    return (
      <Button disabled={isLoading} onClick={() => void withdraw()}>
        Withdraw
      </Button>
    );
  } else {
    return <Dash />;
  }
});
