'use client';

import { Cell, HeaderCell, LoadingCell } from './market-trades';
import { connectionStore } from '@/shared/model/connection';
import { observer } from 'mobx-react-lite';
import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import dynamic from 'next/dynamic';
import { Density } from '@penumbra-zone/ui/Density';
import { usePositions } from '@/pages/trade/api/positions.ts';

const LoadingRow = () => {
  return (
    <div className='grid grid-cols-7 text-text-secondary border-b border-other-tonalStroke'>
      {Array.from({ length: 7 }).map((_, index) => (
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

const ErrorNotice = ({ error }: { error: unknown }) => {
  return (
    <div className='p-5'>
      <Text small color='destructive.light'>
        {String(error)}
      </Text>
    </div>
  );
};

const PositionsInner = observer(() => {
  const { connected } = connectionStore;
  const { data, isLoading, error } = usePositions();

  if (!connected) {
    return <NotConnectedNotice />;
  }

  if (error) {
    return <ErrorNotice error={error} />;
  }

  return (
    <div className='pt-4 px-4 pb-0 overflow-x-auto'>
      <div className='sticky top-0 z-10 grid grid-cols-7 text-text-secondary border-b border-other-tonalStroke bg-app-main'>
        <HeaderCell>Side</HeaderCell>
        <HeaderCell>Trade Amount</HeaderCell>
        <HeaderCell>Effective Price</HeaderCell>
        <HeaderCell>Fee Tier</HeaderCell>
        <HeaderCell>Status</HeaderCell>
        <HeaderCell>Position ID</HeaderCell>
        <HeaderCell>Actions</HeaderCell>
      </div>

      {isLoading && Array.from({ length: 15 }).map((_, i) => <LoadingRow key={i} />)}

      <Density compact>
        {data
          ?.filter(p => p.positionState === 'opened')
          .map(p => (
            <div key={p.positionId} className='grid grid-cols-7 border-b border-other-tonalStroke'>
              <Cell>
                <div className='flex flex-col gap-2'>
                  {p.orders.map((o, i) => (
                    <Text
                      detail
                      color={o.side === 'Buy' ? 'success.light' : 'destructive.light'}
                      key={i}
                    >
                      {o.side}
                    </Text>
                  ))}
                </div>
              </Cell>
              <Cell>
                <div className='flex flex-col gap-2'>
                  {p.orders.map((o, i) => (
                    <ValueViewComponent valueView={o.tradeAmount} context='table' key={i} />
                  ))}
                </div>
              </Cell>
              <Cell>
                <div className='flex flex-col gap-2'>
                  {p.orders.map((o, i) => (
                    <ValueViewComponent valueView={o.effectivePrice} context='table' key={i} />
                  ))}
                </div>
              </Cell>
              <Cell>
                <Text detail color='text.secondary'>
                  {p.fee}%
                </Text>
              </Cell>
              <Cell>
                <Text detail color='text.secondary'>
                  {p.positionState}
                </Text>
              </Cell>
              <Cell>
                <Text detail color='text.secondary' truncate>
                  {p.positionId}
                </Text>
              </Cell>
              <Cell>
                <Text detail color='text.secondary'>
                  -
                </Text>
              </Cell>
            </div>
          ))}
      </Density>
    </div>
  );
});

const Positions = dynamic(() => Promise.resolve(PositionsInner), {
  ssr: false,
});

export default Positions;
