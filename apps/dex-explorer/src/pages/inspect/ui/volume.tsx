import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ArrowRight } from 'lucide-react';
import { Icon } from '@penumbra-zone/ui/Icon';
import { Density } from '@penumbra-zone/ui/Density';
import { Table } from '@penumbra-zone/ui/Table';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { useLpIdInUrl } from '@/pages/inspect/ui/result.tsx';
import { useLpPosition } from '@/pages/inspect/lp/api/position.ts';
import { VolumeAndFeesResponse } from '@/shared/api/server/position/timeline/types.ts';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card } from '@penumbra-zone/ui/Card';

const skeletonRows = 4;

const LoadingState = () => {
  return (
    <Card>
      <div className='w-full'>
        <div className='w-full'>
          {[...Array<undefined>(skeletonRows)].map((_, rowIndex) => (
            <div
              className={`flex px-4 py-4 ${rowIndex < skeletonRows - 1 ? 'border-b border-gray-600' : ''}`}
              key={rowIndex}
            >
              {[...Array<undefined>(6)].map((_, colIndex) => (
                <div className='flex-1 px-2' key={colIndex}>
                  {colIndex === 0 ? (
                    <div className='flex items-center gap-4'>
                      <div className='w-8 h-8 rounded-full' aria-hidden='true'>
                        <Skeleton />
                      </div>
                      <div className='w-4 h-4' aria-hidden='true'>
                        <Skeleton />
                      </div>
                      <div className='w-8 h-8 rounded-full' aria-hidden='true'>
                        <Skeleton />
                      </div>
                    </div>
                  ) : (
                    <div className='w-2/3 h-8' aria-hidden='true'>
                      <Skeleton />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const DataBody = ({ v }: { v: VolumeAndFeesResponse }) => {
  return (
    <Density compact>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Text color='text.secondary'>Volume By Route</Text>
            </Table.Th>
            <Table.Th>
              <Text color='text.secondary'>Execs</Text>
            </Table.Th>
            <Table.Th>
              <div className='flex items-center gap-1'>
                <Text color='text.secondary'>Vol.</Text>
                <AssetIcon metadata={v.asset1} size='sm' />
              </div>
            </Table.Th>
            <Table.Th>
              <div className='flex items-center gap-1'>
                <Text color='text.secondary'>Vol.</Text>
                <AssetIcon metadata={v.asset2} size='sm' />
              </div>
            </Table.Th>
            <Table.Th>
              <div className='flex items-center gap-1'>
                <Text color='text.secondary'>Fees</Text>
                <AssetIcon metadata={v.asset1} size='sm' />
              </div>
            </Table.Th>
            <Table.Th>
              <div className='flex items-center gap-1'>
                <Text color='text.secondary'>Fees</Text>
                <AssetIcon metadata={v.asset2} size='sm' />
              </div>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td hAlign='center'>
              <Text color='text.secondary'>Total</Text>
            </Table.Td>
            <Table.Td hAlign='center'>
              <Text color='text.secondary'>{v.totals.executionCount}</Text>
            </Table.Td>
            <Table.Td>
              <ValueViewComponent valueView={v.totals.volume1} abbreviate={true} />
            </Table.Td>
            <Table.Td>
              <ValueViewComponent valueView={v.totals.volume2} abbreviate={true} />
            </Table.Td>
            <Table.Td>
              <ValueViewComponent valueView={v.totals.fees1} abbreviate={true} />
            </Table.Td>
            <Table.Td>
              <ValueViewComponent valueView={v.totals.fees2} abbreviate={true} />
            </Table.Td>
          </Table.Tr>
          {v.all.map((row, i) => {
            return (
              <Table.Tr key={i}>
                <Table.Td>
                  <div className='flex items-center gap-2'>
                    <AssetIcon metadata={row.contextAssetStart} />
                    <Icon IconComponent={ArrowRight} color='text.primary' size='sm' />
                    <AssetIcon metadata={row.contextAssetEnd} />
                  </div>
                </Table.Td>
                <Table.Td hAlign='center'>
                  <Text color='text.secondary'>{row.executionCount}</Text>
                </Table.Td>
                <Table.Td>
                  <ValueViewComponent valueView={row.volume1} abbreviate={true} />
                </Table.Td>
                <Table.Td>
                  <ValueViewComponent valueView={row.volume2} abbreviate={true} />
                </Table.Td>
                <Table.Td>
                  <ValueViewComponent valueView={row.fees1} abbreviate={true} />
                </Table.Td>
                <Table.Td>
                  <ValueViewComponent valueView={row.fees2} abbreviate={true} />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Density>
  );
};

export const VolumeAndFeesTable = () => {
  const id = useLpIdInUrl();
  const { data, isLoading } = useLpPosition(id);

  return (
    <div className='flex flex-col gap-2'>
      <Text xxl color='base.white'>
        Volume & Fees
      </Text>
      {isLoading && <LoadingState />}
      {data && <DataBody v={data.volumeAndFees} />}
    </div>
  );
};
