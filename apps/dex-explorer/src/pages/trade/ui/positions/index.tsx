'use client';

import Link from 'next/link';
import orderBy from 'lodash/orderBy';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { connectionStore } from '@/shared/model/connection';
import { observer } from 'mobx-react-lite';
import { Text } from '@penumbra-zone/ui/Text';
import { Table } from '@penumbra-zone/ui/Table';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Density } from '@penumbra-zone/ui/Density';
import { Tooltip, TooltipProvider } from '@penumbra-zone/ui/Tooltip';
import { stateToString, usePositions } from '@/pages/trade/api/positions.ts';
import { positionsStore } from '@/pages/trade/model/positions';
import { pnum } from '@penumbra-zone/types/pnum';
import { useAssets } from '@/shared/api/assets';
import { SquareArrowOutUpRight, ChevronUp, ChevronDown } from 'lucide-react';
import { usePathToMetadata } from '../../model/use-path';
import { PositionsCurrentValue } from '../positions-current-value';
import { LoadingCell } from '../market-trades';
import { NotConnectedNotice } from './not-connected-notice';
import { ErrorNotice } from './error-notice';
import { NoPositions } from './no-positions';
import { HeaderActionButton } from './header-action-button';
import { ActionButton } from './action-button';
import { Dash } from './dash';

const Positions = observer(({ showInactive }: { showInactive: boolean }) => {
  const { connected, subaccount } = connectionStore;
  const { baseAsset, quoteAsset } = usePathToMetadata();
  const { data: assets } = useAssets();
  const { data, isLoading, error } = usePositions(subaccount);
  const { displayPositions, setPositions, setAssets } = positionsStore;
  const [sortBy, setSortBy] = useState<{
    key: string;
    direction: 'desc' | 'asc';
  }>({
    key: 'effectivePrice',
    direction: 'desc',
  });

  const sortedPositions = useMemo(() => {
    return orderBy(
      displayPositions
        .filter(position => (showInactive ? true : !position.isWithdrawn))
        .map(position => ({
          ...position,
          sortValues: {
            type: position.isOpened ? position.orders[0]?.direction : stateToString(position.state),
            tradeAmount: position.isWithdrawn ? 0 : pnum(position.orders[0]?.amount).toNumber(),
            effectivePrice:
              position.isClosed || position.isWithdrawn
                ? 0
                : pnum(position.orders[0]?.effectivePrice).toNumber(),
            basePrice:
              position.isClosed || position.isWithdrawn
                ? 0
                : pnum(position.orders[0]?.basePrice).toNumber(),
            feeTier:
              position.isClosed || position.isWithdrawn ? 0 : Number(position.fee.replace('%', '')),
            positionId: position.idString,
          },
        })),
      `sortValues.${sortBy.key}`,
      sortBy.direction,
    );
  }, [displayPositions, showInactive, sortBy]);

  const SortableTableHeader = useCallback(
    ({ sortKey, children }: { sortKey: string; children: React.ReactNode }) => {
      return (
        <Table.Th density='slim'>
          <button
            className='flex'
            onClick={() => {
              setSortBy({
                key: sortKey,
                direction: sortBy.key === sortKey && sortBy.direction === 'desc' ? 'asc' : 'desc',
              });
            }}
          >
            <Text
              tableHeadingSmall
              color={sortBy.key === sortKey ? 'text.primary' : 'text.secondary'}
            >
              {children}
            </Text>
            {sortKey === sortBy.key && (
              <>
                {sortBy.direction === 'asc' ? (
                  <ChevronUp className='w-4 h-4 text-text-primary' />
                ) : (
                  <ChevronDown className='w-4 h-4 text-text-primary' />
                )}
              </>
            )}
          </button>
        </Table.Th>
      );
    },
    [sortBy, setSortBy],
  );

  useEffect(() => {
    if (data) {
      setPositions(data);
    }
  }, [data, setPositions]);

  useEffect(() => {
    setAssets(assets ?? []);
  }, [assets, setAssets]);

  useEffect(() => {
    if (baseAsset && quoteAsset) {
      positionsStore.setCurrentPair(baseAsset, quoteAsset);
    }
  }, [baseAsset, quoteAsset]);

  if (!connected) {
    return <NotConnectedNotice />;
  }

  if (error) {
    return <ErrorNotice />;
  }

  if (!sortedPositions.length) {
    return <NoPositions />;
  }

  return (
    <TooltipProvider>
      <Density variant='slim'>
        <div className='flex justify-center px-4 overflow-x-auto'>
          <Table bgColor='base.blackAlt'>
            <Table.Thead>
              <Table.Tr>
                <SortableTableHeader sortKey='type'>Type</SortableTableHeader>
                <SortableTableHeader sortKey='tradeAmount'>Trade Amount</SortableTableHeader>
                <SortableTableHeader sortKey='effectivePrice'>Effective Price</SortableTableHeader>
                <SortableTableHeader sortKey='feeTier'>Fee Tier</SortableTableHeader>
                <SortableTableHeader sortKey='basePrice'>Base Price</SortableTableHeader>
                <Table.Th density='slim'>
                  <Text tableHeadingSmall>Current Value</Text>
                </Table.Th>
                <SortableTableHeader sortKey='positionId'>Position ID</SortableTableHeader>
                <Table.Th hAlign='right' density='slim'>
                  <HeaderActionButton displayPositions={sortedPositions} />
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading &&
                Array.from({ length: 15 }).map((_, i) => (
                  <Table.Tr key={i}>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Table.Td key={index}>
                        <LoadingCell key={index} />
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              {sortedPositions.map(position => {
                return (
                  <Table.Tr key={position.idString}>
                    <Table.Td density='slim'>
                      <div className='flex flex-col gap-4'>
                        {position.orders
                          .slice(0, position.isWithdrawn ? 1 : Infinity)
                          .map((order, i) =>
                            position.isOpened ? (
                              <Text
                                as='div'
                                detail
                                color={
                                  order.direction === 'Buy' ? 'success.light' : 'destructive.light'
                                }
                                key={i}
                              >
                                {order.direction}
                              </Text>
                            ) : (
                              <Text as='div' detail color='neutral.light' key={i}>
                                {stateToString(position.state)}
                              </Text>
                            ),
                          )}
                      </div>
                    </Table.Td>
                    <Table.Td density='slim'>
                      <div className='flex flex-col gap-4'>
                        {position.isWithdrawn ? (
                          <Dash />
                        ) : (
                          position.orders.map((order, i) => (
                            <ValueViewComponent
                              key={i}
                              valueView={
                                position.isClosed && i === 1 ? order.basePrice : order.amount
                              }
                              trailingZeros={false}
                              density='slim'
                            />
                          ))
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td density='slim'>
                      {/* Fight display inline 4 px spacing */}
                      <div className='flex flex-col gap-2 -mb-1 items-start'>
                        {position.isClosed || position.isWithdrawn ? (
                          <Dash />
                        ) : (
                          position.orders.map((order, i) => (
                            <Tooltip
                              key={i}
                              message={
                                <>
                                  <Text as='div' detail color='text.primary'>
                                    Base price: {pnum(order.basePrice).toFormattedString()}
                                  </Text>
                                  <Text as='div' detail color='text.primary'>
                                    Fee:{' '}
                                    {pnum(order.basePrice)
                                      .toBigNumber()
                                      .minus(pnum(order.effectivePrice).toBigNumber())
                                      .toString()}{' '}
                                    ({position.fee})
                                  </Text>
                                  <Text as='div' detail color='text.primary'>
                                    Effective price:{' '}
                                    {pnum(order.effectivePrice).toFormattedString()}
                                  </Text>
                                </>
                              }
                            >
                              <div>
                                <ValueViewComponent
                                  valueView={order.effectivePrice}
                                  trailingZeros={false}
                                  density='slim'
                                />
                              </div>
                            </Tooltip>
                          ))
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td density='slim'>
                      <Text as='div' detailTechnical color='text.primary'>
                        {position.isClosed || position.isWithdrawn ? <Dash /> : position.fee}
                      </Text>
                    </Table.Td>
                    <Table.Td density='slim'>
                      <div className='flex flex-col gap-4'>
                        {position.isClosed || position.isWithdrawn ? (
                          <Dash />
                        ) : (
                          position.orders.map((order, i) => (
                            <ValueViewComponent
                              key={i}
                              valueView={order.basePrice}
                              trailingZeros={false}
                              density='slim'
                            />
                          ))
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td density='slim'>
                      <div className='flex flex-col gap-4'>
                        {position.isWithdrawn ? (
                          <Dash />
                        ) : (
                          position.orders.map((order, i) => (
                            <PositionsCurrentValue key={i} order={order} />
                          ))
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td density='slim'>
                      <div className='flex max-w-[104px]'>
                        <Text as='div' detailTechnical color='text.primary' truncate>
                          {position.idString}
                        </Text>
                        <Link href={`/inspect/lp/${position.idString}`}>
                          <SquareArrowOutUpRight className='w-4 h-4 text-text-secondary' />
                        </Link>
                      </div>
                    </Table.Td>
                    <Table.Td hAlign='right' density='slim'>
                      <ActionButton id={position.id} position={position.position} />
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </div>
      </Density>
    </TooltipProvider>
  );
});

export default Positions;
