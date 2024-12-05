'use client';

import { Cell, HeaderCell, LoadingCell } from './market-trades';
import { connectionStore } from '@/shared/model/connection';
import { observer } from 'mobx-react-lite';
import { Text, TextProps } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import dynamic from 'next/dynamic';
import { Density } from '@penumbra-zone/ui/Density';
import { Order, PositionData, stateToString, usePositions } from '@/pages/trade/api/positions.ts';
import {
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { bech32mPositionId } from '@penumbra-zone/bech32m/plpid';
import { Button } from '@penumbra-zone/ui/Button';
import { positionsStore } from '@/pages/trade/model/positions';

const LoadingRow = () => {
  return (
    <div className='grid grid-cols-8 text-text-secondary border-b border-other-tonalStroke'>
      {Array.from({ length: 8 }).map((_, index) => (
        <LoadingCell key={index} />
      ))}
    </div>
  );
};

const NotConnectedNotice = () => {
  return (
    <div className='p-5'>
      <Text small color='text.secondary'>
        Connect your wallet
      </Text>
    </div>
  );
};

const NoPositions = () => {
  return (
    <div className='p-5'>
      <Text small color='text.secondary'>
        No liquidity positions opened
      </Text>
    </div>
  );
};

const ErrorNotice = ({ error }: { error: unknown }) => {
  return (
    <div className='p-5'>
      <Text small color='destructive.light'>
        {String(error)}
      </Text>
    </div>
  );
};

const getStateLabel = (
  state: PositionState_PositionStateEnum,
  side?: Order['side'],
): { label: string; color: TextProps['color'] } => {
  if (side && state === PositionState_PositionStateEnum.OPENED) {
    if (side === 'Buy') {
      return { label: side, color: 'success.light' };
    } else {
      return { label: side, color: 'destructive.light' };
    }
  } else {
    return { label: stateToString(state), color: 'neutral.light' };
  }
};

const ActionButton = observer(
  ({ state, id }: { state: PositionState_PositionStateEnum; id: PositionId }) => {
    const { loading, closePositions, withdrawPositions } = positionsStore;

    if (state === PositionState_PositionStateEnum.OPENED) {
      return (
        <Button onClick={() => void closePositions([id])} disabled={loading}>
          Close
        </Button>
      );
    } else if (state === PositionState_PositionStateEnum.CLOSED) {
      return (
        <Button disabled={loading} onClick={() => void withdrawPositions([id])}>
          Withdraw
        </Button>
      );
    } else {
      return (
        <Text detail color='text.secondary'>
          -
        </Text>
      );
    }
  },
);

const RowLabel = ({ p }: { p: PositionData }) => {
  // A withdrawn position has no orders
  if (!p.orders.length) {
    const { label, color } = getStateLabel(p.positionState);
    return (
      <Text detail color={color}>
        {label}
      </Text>
    );
  }
  // For opened or closed positions
  return p.orders.map((o, i) => {
    const { label, color } = getStateLabel(p.positionState, o.side);
    return (
      <Text detail color={color} key={i}>
        {label}
      </Text>
    );
  });
};

const AmountDisplay = ({
  p,
  kind,
}: {
  p: PositionData;
  kind: 'tradeAmount' | 'effectivePrice';
}) => {
  if (!p.orders.length) {
    return (
      <Text detail color='text.secondary'>
        -
      </Text>
    );
  }
  return p.orders.map((o, i) => (
    <ValueViewComponent
      valueView={kind === 'tradeAmount' ? o.tradeAmount : o.effectivePrice}
      key={i}
    />
  ));
};

const MAX_ACTION_COUNT = 15;

const HeaderActionButton = observer(() => {
  const { data } = usePositions();
  const { loading, closePositions, withdrawPositions } = positionsStore;

  const openedPositions =
    data?.filter(p => p.positionState === PositionState_PositionStateEnum.OPENED) ?? [];
  if (openedPositions.length > 1) {
    return (
      <Button
        actionType='destructive'
        disabled={loading}
        onClick={() =>
          void closePositions(openedPositions.slice(0, MAX_ACTION_COUNT).map(p => p.positionId))
        }
      >
        Close Batch
      </Button>
    );
  }

  const closedPositions =
    data?.filter(p => p.positionState === PositionState_PositionStateEnum.CLOSED) ?? [];
  if (closedPositions.length > 1) {
    return (
      <Button
        actionType='destructive'
        disabled={loading}
        onClick={() =>
          void withdrawPositions(closedPositions.map(p => p.positionId).slice(0, MAX_ACTION_COUNT))
        }
      >
        Withdraw Batch
      </Button>
    );
  }

  return 'Actions';
});

const PositionsInner = observer(({ showInactive }: { showInactive: boolean }) => {
  const { connected } = connectionStore;
  const { data, isLoading, error } = usePositions();

  if (!connected) {
    return <NotConnectedNotice />;
  }

  if (error) {
    return <ErrorNotice error={error} />;
  }

  if (data?.length === 0) {
    return <NoPositions />;
  }

  return (
    <Density medium>
      <div className='pt-4 px-4 pb-0 overflow-x-auto'>
        <div className='sticky top-0 z-10 grid grid-cols-8 text-text-secondary border-b border-other-tonalStroke bg-app-main'>
          <HeaderCell>Side</HeaderCell>
          <HeaderCell>Trade Amount</HeaderCell>
          <HeaderCell>Effective Price</HeaderCell>
          <HeaderCell>Fee Tier</HeaderCell>
          <HeaderCell>Base Price</HeaderCell>
          <HeaderCell>Current Value</HeaderCell>
          <HeaderCell>Position ID</HeaderCell>
          <HeaderCell>
            <HeaderActionButton />
          </HeaderCell>
        </div>

        {isLoading && Array.from({ length: 15 }).map((_, i) => <LoadingRow key={i} />)}

        {data
          ?.filter(p =>
            showInactive ? true : p.positionState !== PositionState_PositionStateEnum.WITHDRAWN,
          )
          .map(p => {
            const bech32PositionId = bech32mPositionId(p.positionId);
            return (
              <div
                key={bech32PositionId}
                className='grid grid-cols-8 border-b border-other-tonalStroke'
              >
                <Cell>
                  <div className='flex flex-col gap-2'>
                    <RowLabel p={p} />
                  </div>
                </Cell>
                <Cell>
                  <div className='flex flex-col gap-2'>
                    <AmountDisplay p={p} kind='tradeAmount' />
                  </div>
                </Cell>
                <Cell>
                  <div className='flex flex-col gap-2'>
                    <AmountDisplay p={p} kind='effectivePrice' />
                  </div>
                </Cell>
                <Cell>
                  <Text detail color='text.secondary'>
                    {p.fee / 100}%
                  </Text>
                </Cell>
                <Cell>
                  <Text detail color='text.secondary'>
                    -
                  </Text>
                </Cell>
                <Cell>
                  <Text detail color='text.secondary'>
                    -
                  </Text>
                </Cell>
                <Cell>
                  <Text detail color='text.secondary' truncate>
                    {bech32PositionId}
                  </Text>
                </Cell>
                <Cell>
                  <ActionButton state={p.positionState} id={p.positionId} />
                </Cell>
              </div>
            );
          })}
      </div>
    </Density>
  );
});

const Positions = dynamic(() => Promise.resolve(PositionsInner), {
  ssr: false,
});

export default Positions;
