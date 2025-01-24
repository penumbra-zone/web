'use client';

import Link from 'next/link';
import { useEffect } from 'react';
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
import { useRegistryAssets } from '@/shared/api/registry';
import { SquareArrowOutUpRight } from 'lucide-react';
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
  const { connected } = connectionStore;
  const { baseAsset, quoteAsset } = usePathToMetadata();
  const { data: assets } = useRegistryAssets();
  const { data, isLoading, error } = usePositions();
  const { displayPositions, setPositions, setAssets } = positionsStore;

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

  if (!displayPositions.length) {
    return <NoPositions />;
  }

  return (
    <TooltipProvider>
      <Density variant='slim'>
        <div className='flex justify-center px-4 overflow-x-auto'>
          <Table bgColor='base.blackAlt'>
            <Table.Thead>
              <Table.Tr>
                <Table.Th density='slim'>
                  <Text tableHeadingSmall>Type</Text>
                </Table.Th>
                <Table.Th density='slim'>
                  <Text tableHeadingSmall>Trade Amount</Text>
                </Table.Th>
                <Table.Th density='slim'>
                  <Text tableHeadingSmall>Effective Price</Text>
                </Table.Th>
                <Table.Th density='slim'>
                  <Text tableHeadingSmall whitespace='nowrap'>
                    Fee Tier
                  </Text>
                </Table.Th>
                <Table.Th density='slim'>
                  <Text tableHeadingSmall>Base Price</Text>
                </Table.Th>
                <Table.Th density='slim'>
                  <Text tableHeadingSmall>Current Value</Text>
                </Table.Th>
                <Table.Th density='slim'>
                  <Text tableHeadingSmall>Position ID</Text>
                </Table.Th>
                <Table.Th hAlign='right' density='slim'>
                  <HeaderActionButton displayPositions={displayPositions} />
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
              {displayPositions
                .filter(position => (showInactive ? true : !position.isWithdrawn))
                .map(position => {
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
                                    order.direction === 'Buy'
                                      ? 'success.light'
                                      : 'destructive.light'
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
