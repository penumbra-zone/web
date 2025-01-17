import { observer } from 'mobx-react-lite';
import { Button } from '@penumbra-zone/ui/Button';
import { positionsStore, DisplayPosition } from '@/pages/trade/model/positions';

const MAX_ACTION_COUNT = 15;

export const HeaderActionButton = observer(
  ({ displayPositions }: { displayPositions: DisplayPosition[] }) => {
    const { loading, closePositions, withdrawPositions } = positionsStore;

    const openedPositions = displayPositions
      .filter(position => position.isOpened)
      .slice(0, MAX_ACTION_COUNT)
      .map(position => ({
        id: position.id,
        position: position.position,
      }));

    if (openedPositions.length > 1) {
      return (
        <Button
          density='slim'
          actionType='destructive'
          disabled={loading}
          onClick={() => void closePositions(openedPositions)}
        >
          Close Batch ({openedPositions.length})
        </Button>
      );
    }

    const closedPositions = displayPositions
      .filter(position => position.isClosed)
      .slice(0, MAX_ACTION_COUNT)
      .map(position => ({
        id: position.id,
        position: position.position,
      }));

    if (closedPositions.length > 1) {
      return (
        <Button
          density='slim'
          actionType='destructive'
          disabled={loading}
          onClick={() => void withdrawPositions(closedPositions)}
        >
          Withdraw Batch ({closedPositions.length})
        </Button>
      );
    }

    return 'Actions';
  },
);
