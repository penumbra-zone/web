import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@penumbra-zone/ui/Button';
import { DisplayPosition } from '../model/types';
import { withdrawPositions } from '../api/withdraw-positions';
import { closePositions } from '../api/close-positions';

const MAX_ACTION_COUNT = 15;

export const HeaderActionButton = observer(
  ({ displayPositions }: { displayPositions: DisplayPosition[] }) => {
    const [isLoading, setIsLoading] = useState(false);

    const openedPositions = displayPositions
      .filter(position => position.isOpened)
      .slice(0, MAX_ACTION_COUNT)
      .map(position => ({
        id: position.id,
        position: position.position,
      }));

    const closedPositions = displayPositions
      .filter(position => position.isClosed)
      .slice(0, MAX_ACTION_COUNT)
      .map(position => ({
        id: position.id,
        position: position.position,
      }));

    const withdraw = async () => {
      setIsLoading(true);
      await withdrawPositions(closedPositions);
      setIsLoading(false);
    };

    const close = async () => {
      setIsLoading(true);
      await closePositions(openedPositions);
      setIsLoading(false);
    };

    if (openedPositions.length > 1) {
      return (
        <Button actionType='destructive' disabled={isLoading} onClick={() => void close()}>
          Close Batch ({openedPositions.length})
        </Button>
      );
    }

    if (closedPositions.length > 1) {
      return (
        <Button actionType='destructive' disabled={isLoading} onClick={() => void withdraw()}>
          Withdraw Batch ({closedPositions.length})
        </Button>
      );
    }

    return 'Actions';
  },
);
