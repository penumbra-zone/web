'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { LoadingCell } from './market-trades';
import { connectionStore } from '@/shared/model/connection';
import { observer } from 'mobx-react-lite';
import { Text, TextProps } from '@penumbra-zone/ui/Text';
import { Table } from '@penumbra-zone/ui/Table';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Density } from '@penumbra-zone/ui/Density';
import { Tooltip, TooltipProvider } from '@penumbra-zone/ui/Tooltip';
import { stateToString, usePositions } from '@/pages/trade/api/positions.ts';
import { Button } from '@penumbra-zone/ui/Button';
import {
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { DisplayPosition, positionsStore } from '@/pages/trade/model/positions';
import { pnum } from '@penumbra-zone/types/pnum';
import { useRegistryAssets } from '@/shared/api/registry';
import { usePathToMetadata } from '../model/use-path';
import { PositionsCurrentValue } from './positions-current-value';
import { SquareArrowOutUpRight, Wallet2 } from 'lucide-react';
import { ConnectButton } from '@/features/connect/connect-button';
import { BlockchainError } from '@/shared/ui/blockchain-error';

const NotConnectedNotice = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
      <div className='w-12 h-12 text-text-secondary'>
        <Wallet2 className='w-full h-full' />
      </div>
      <Text color='text.secondary' small>
        Connect wallet to see your positions
      </Text>
      <div className='w-fit'>
        <ConnectButton variant='minimal' actionType='default' />
      </div>
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

const ErrorNotice = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <BlockchainError
        message='An error occurred while loading data from the blockchain'
        direction='column'
      />
    </div>
  );
};

const getStateLabel = (
  state: PositionState_PositionStateEnum,
  direction: DisplayPosition['orders'][number]['direction'],
): { label: string; color: TextProps['color'] } => {
  if (state === PositionState_PositionStateEnum.OPENED) {
    if (direction === 'Buy') {
      return { label: direction, color: 'success.light' };
    } else {
      return { label: direction, color: 'destructive.light' };
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
        <Button density='slim' onClick={() => void closePositions([id])} disabled={loading}>
          Close
        </Button>
      );
    } else if (state === PositionState_PositionStateEnum.CLOSED) {
      return (
        <Button density='slim' disabled={loading} onClick={() => void withdrawPositions([id])}>
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

const MAX_ACTION_COUNT = 15;

const HeaderActionButton = observer(
  ({ displayPositions }: { displayPositions: DisplayPosition[] }) => {
    const { loading, closePositions, withdrawPositions } = positionsStore;

    const openedPositions = displayPositions.filter(
      position => position.state === PositionState_PositionStateEnum.OPENED,
    );

    if (openedPositions.length > 1) {
      return (
        <Button
          density='slim'
          actionType='destructive'
          disabled={loading}
          onClick={() =>
            void closePositions(
              openedPositions.slice(0, MAX_ACTION_COUNT).map(position => position.id),
            )
          }
        >
          Close Batch
        </Button>
      );
    }

    const closedPositions = displayPositions.filter(
      position => position.state === PositionState_PositionStateEnum.CLOSED,
    );

    if (closedPositions.length > 1) {
      return (
        <Button
          density='slim'
          actionType='destructive'
          disabled={loading}
          onClick={() =>
            void withdrawPositions(
              closedPositions.map(position => position.id).slice(0, MAX_ACTION_COUNT),
            )
          }
        >
          Withdraw Batch
        </Button>
      );
    }

    return 'Actions';
  },
);

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
                .filter(position => (showInactive ? true : position.isActive))
                .map(position => {
                  return (
                    <Table.Tr key={position.idString}>
                      <Table.Td density='slim'>
                        <div className='flex flex-col gap-4'>
                          {position.orders
                            .map(order => getStateLabel(position.state, order.direction))
                            .map(({ label, color }, i) => (
                              <Text as='div' detail color={color} key={i}>
                                {label}
                              </Text>
                            ))}
                        </div>
                      </Table.Td>
                      <Table.Td density='slim'>
                        <div className='flex flex-col gap-4'>
                          {position.orders.map((order, i) => (
                            <ValueViewComponent
                              key={i}
                              valueView={order.amount}
                              trailingZeros={false}
                              density='slim'
                            />
                          ))}
                        </div>
                      </Table.Td>
                      <Table.Td density='slim'>
                        {/* Fight display inline 4 px spacing */}
                        <div className='flex flex-col gap-2 -mb-1 items-start'>
                          {position.orders.map((order, i) => (
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
                          ))}
                        </div>
                      </Table.Td>
                      <Table.Td density='slim'>
                        <Text as='div' detailTechnical color='text.primary'>
                          {position.fee}
                        </Text>
                      </Table.Td>
                      <Table.Td density='slim'>
                        <div className='flex flex-col gap-4'>
                          {position.orders.map((order, i) => (
                            <ValueViewComponent
                              key={i}
                              valueView={order.basePrice}
                              trailingZeros={false}
                              density='slim'
                            />
                          ))}
                        </div>
                      </Table.Td>
                      <Table.Td density='slim'>
                        <div className='flex flex-col gap-4'>
                          {position.orders.map((order, i) => (
                            <PositionsCurrentValue key={i} order={order} />
                          ))}
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
                        <ActionButton state={position.state} id={position.id} />
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
